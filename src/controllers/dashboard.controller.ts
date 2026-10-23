import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import * as path from 'node:path';
import { performance } from 'node:perf_hooks';
import { OUTPUT_FORMATS, toXlsxBuffer } from '../common/functions/export.functions';
import { AppError } from '../common/helpers/error.helper';
import { FILE_CONSTANTS } from '../common/types/enums';
import { Parser } from '../core/Parser';
import { analyzeRows } from '../engine/analyze';
import { Dataset, TextFormat, datasetSheets, serializeDataset } from '../engine/dataset';
import { AnalysisSession, ViewQuery } from '../engine/session';
import { DEFAULT_SETTINGS, resolveSettings, toAnalyzeOptions } from '../engine/settings';
import { DashboardSessions } from '../services/dashboard-sessions.service';
import { readVersion } from '../cli/version';

const EXPORT_FORMATS = ['json', 'csv', 'md', 'txt', 'xlsx'] as const;
type ExportFormat = (typeof EXPORT_FORMATS)[number];

const MIME: Record<ExportFormat, string> = {
  json: 'application/json',
  csv: 'text/csv',
  md: 'text/markdown',
  txt: 'text/plain',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const upload = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: FILE_CONSTANTS.MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ((FILE_CONSTANTS.SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)) cb(null, true);
    else
      cb(
        new HttpException(
          'Unsupported file type. Upload a .csv or .xlsx file.',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
  },
});

/** Library errors (bad column, empty file...) are client errors */
const asHttp = (error: unknown): HttpException =>
  error instanceof HttpException
    ? error
    : error instanceof AppError
      ? new HttpException({ statusCode: 400, message: error.message, code: error.code }, 400)
      : new HttpException(`Unexpected error: ${(error as Error).message}`, 500);

/** A safe download name: letters, digits, dot, dash, underscore */
const safeName = (name: string) =>
  name
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'numsy';

interface ExportBody {
  /** A session from POST /api/parse or /api/text */
  sessionId?: string;
  /** Or free text, read as one value per line (validate) or scanned for numbers (extract) */
  text?: string;
  mode?: 'validate' | 'extract';
  format?: string;
  settings?: unknown;
}

/**
 * REST API behind the local dashboard (`numsy dashboard`)
 */
@Controller('api')
export class DashboardController {
  private readonly parser = new Parser({ enableLogging: false, normalizeColumns: false });

  constructor(private readonly sessions: DashboardSessions) {}

  /**
   * Version, limits, formats and default settings
   */
  @Get('meta')
  meta() {
    return {
      name: 'numsy',
      version: readVersion(),
      mode: 'local',
      maxFileSize: FILE_CONSTANTS.MAX_FILE_SIZE,
      accept: FILE_CONSTANTS.SUPPORTED_EXTENSIONS,
      formats: EXPORT_FORMATS.map((id) => ({ id, ...OUTPUT_FORMATS[id] })),
      defaults: DEFAULT_SETTINGS,
    };
  }

  /**
   * Parse an upload in memory and open a session for it
   */
  @Post('parse')
  @HttpCode(200)
  @UseInterceptors(upload)
  async parse(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new HttpException('No file uploaded (field name: "file")', 400);
    try {
      const started = performance.now();
      const parsed = await this.parser.parseBuffer(file.buffer, file.originalname);
      const parseMs = Math.round(performance.now() - started);
      const { id, session } = this.sessions.create({
        kind: 'file',
        fileName: file.originalname,
        rows: parsed.data,
        columns: parsed.detectedColumns,
      });
      return {
        sessionId: id,
        ...session.info(),
        fileName: file.originalname,
        size: file.size,
        parseMs,
      };
    } catch (error) {
      throw asHttp(error);
    }
  }

  /**
   * Open a session for pasted text: one value per line (validate) or free text (extract)
   */
  @Post('text')
  @HttpCode(200)
  text(@Body() body: { text?: unknown; mode?: unknown }) {
    if (typeof body?.text !== 'string' || !body.text.trim()) {
      throw new HttpException('Send some text to analyse', 400);
    }
    const mode = body.mode === 'validate' ? 'validate' : 'extract';
    const { id, session } = this.sessions.create({ kind: 'text', mode, text: body.text });
    return { sessionId: id, ...session.info(), size: body.text.length, parseMs: 0 };
  }

  /**
   * A page of results for a session with the given settings, search and page
   */
  @Post('view')
  @HttpCode(200)
  view(@Body() body: { sessionId?: string; settings?: unknown; query?: ViewQuery }) {
    const session = this.session(body?.sessionId);
    try {
      return session.view(resolveSettings(body?.settings), {
        page: Number(body?.query?.page) || 1,
        pageSize: Number(body?.query?.pageSize) || 50,
        search: typeof body?.query?.search === 'string' ? body.query.search.slice(0, 100) : '',
        allColumns: body?.query?.allColumns === true,
      });
    } catch (error) {
      throw asHttp(error);
    }
  }

  /**
   * One-shot analysis of an upload: multipart "file" plus optional settings fields
   */
  @Post('analyze')
  @HttpCode(200)
  @UseInterceptors(upload)
  async analyze(
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: Record<string, unknown>,
  ) {
    if (!file) throw new HttpException('No file uploaded (field name: "file")', 400);
    try {
      const settings = resolveSettings(body);
      const started = performance.now();
      const parsed = await this.parser.parseBuffer(file.buffer, file.originalname);
      const report = analyzeRows(parsed.data, toAnalyzeOptions(settings));
      report.source = file.originalname;
      return { settings, durationMs: Math.round(performance.now() - started), ...report };
    } catch (error) {
      throw asHttp(error);
    }
  }

  /**
   * Export a parsed upload or pasted text in any format, using the dashboard settings
   */
  @Post('export')
  async export(@Body() body: ExportBody, @Res() res: Response): Promise<void> {
    const format = String(body?.format ?? '').toLowerCase() as ExportFormat;
    if (!EXPORT_FORMATS.includes(format)) {
      throw new HttpException(`format must be one of: ${EXPORT_FORMATS.join(', ')}`, 400);
    }

    const settings = resolveSettings(body?.settings);
    let dataset: Dataset;
    let base: string;
    try {
      if (body?.sessionId) {
        const session = this.session(body.sessionId);
        dataset = session.exportDataset(settings);
        base =
          session.source.kind === 'file'
            ? safeName(session.source.fileName)
            : `numsy-${session.source.mode}`;
      } else if (typeof body?.text === 'string') {
        const mode = body.mode === 'validate' ? 'validate' : 'extract';
        dataset = new AnalysisSession({ kind: 'text', mode, text: body.text }).exportDataset(
          settings,
        );
        base = `numsy-${mode}`;
      } else {
        throw new HttpException('Send a sessionId from /api/parse or /api/text, or text', 400);
      }
    } catch (error) {
      throw asHttp(error);
    }

    const content =
      format === 'xlsx'
        ? await toXlsxBuffer(datasetSheets(dataset), { header: settings.header })
        : Buffer.from(
            serializeDataset(dataset, format as TextFormat, true, { header: settings.header }),
            'utf-8',
          );
    const fileName = `${base}-${settings.only}${OUTPUT_FORMATS[format].extension}`;

    res.setHeader('Content-Type', format === 'xlsx' ? MIME.xlsx : `${MIME[format]}; charset=utf-8`);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('X-Numsy-Rows', String(dataset.rows.length));
    res.status(200);
    res.send(content);
  }

  private session(id?: string): AnalysisSession {
    const session = id ? this.sessions.get(String(id)) : undefined;
    if (!session) throw new HttpException('This session has expired. Load the file again.', 404);
    return session;
  }

  /**
   * Forget a session
   */
  @Delete('session/:id')
  @HttpCode(204)
  forget(@Param('id') id: string): void {
    this.sessions.delete(id);
  }
}
