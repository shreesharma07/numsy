import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpException,
  HttpStatus,
  Logger,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { FileProcessorService } from '../services/file-processor.service';

/**
 * Controller for handling file upload and download operations
 */
@Controller('api')
export class AppController {
  private readonly logger = new Logger(AppController.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly tempDir = path.join(process.cwd(), 'temp');

  constructor(private readonly fileProcessor: FileProcessorService) {
    // Ensure directories exist
    this.ensureDirectoriesExist();
  }

  /**
   * Ensures required directories exist
   */
  private ensureDirectoriesExist(): void {
    [this.uploadDir, this.tempDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`Created directory: ${dir}`);
      }
    });
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  health(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Upload and process file endpoint
   * Accepts CSV or Excel files and processes phone numbers
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads');
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `upload-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.csv', '.xlsx', '.xls'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new HttpException(
              'Invalid file type. Only CSV and Excel files are allowed.',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{
    success: boolean;
    message: string;
    downloadId: string;
    summary: any;
  }> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`File uploaded: ${file.originalname} (${file.size} bytes)`);

    try {
      // Process the file
      const result = await this.fileProcessor.processFile(file.path, this.tempDir);

      // Clean up uploaded file
      await this.fileProcessor.cleanupFiles([file.path]);

      // Generate download ID (use timestamp from zip filename)
      const downloadId = path.basename(result.zipFilePath, '.zip');

      return {
        success: true,
        message: 'File processed successfully',
        downloadId,
        summary: {
          totalRecords: result.totalRecords,
          validRecords: result.validRecords,
          invalidRecords: result.invalidRecords,
          phoneColumnDetected: result.phoneColumn,
          analytics: result.analytics,
        },
      };
    } catch (error: unknown) {
      this.logger.error(`File processing error: ${(error as Error)?.message}`);

      // Clean up uploaded file on error
      if (fs.existsSync(file.path)) {
        await this.fileProcessor.cleanupFiles([file.path]);
      }

      throw new HttpException(
        `Failed to process file: ${(error as Error)?.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Download processed ZIP file endpoint
   * Returns the ZIP file and then cleans it up
   */
  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const zipFilePath = path.join(this.tempDir, `${id}.zip`);

    if (!fs.existsSync(zipFilePath)) {
      throw new HttpException('File not found or already downloaded', HttpStatus.NOT_FOUND);
    }

    this.logger.log(`Downloading file: ${zipFilePath}`);

    try {
      // Set response headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="processed_numbers.zip"`);

      // Stream the file
      const fileStream = fs.createReadStream(zipFilePath);

      fileStream.on('error', (error) => {
        this.logger.error(`Stream error: ${error.message}`);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error streaming file',
          });
        }
      });

      fileStream.on('end', () => {
        // Clean up files after download completes
        setTimeout(async () => {
          try {
            // Find associated CSV files
            const validFilePath = path.join(this.tempDir, `valid_numbers_${id.split('_')[1]}.csv`);
            const invalidFilePath = path.join(
              this.tempDir,
              `invalid_numbers_${id.split('_')[1]}.csv`,
            );

            await this.fileProcessor.cleanupFiles([zipFilePath, validFilePath, invalidFilePath]);
            this.logger.log(`Cleaned up files for download ID: ${id}`);
          } catch (cleanupError: unknown) {
            this.logger.error(`Cleanup error: ${(cleanupError as Error)?.message}`);
          }
        }, 1000); // Small delay to ensure download completes
      });

      fileStream.pipe(res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Download error: ${errorMessage}`);
      throw new HttpException('Failed to download file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Cleanup old files endpoint (can be called manually or via cron)
   */
  @Post('cleanup')
  async cleanupOldFiles(): Promise<{ success: boolean; message: string }> {
    try {
      const directories = [this.uploadDir, this.tempDir];
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      for (const dir of directories) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);

            // Delete files older than 1 hour
            if (stats.mtimeMs < oneHourAgo) {
              fs.unlinkSync(filePath);
              this.logger.debug(`Deleted old file: ${filePath}`);
            }
          }
        }
      }

      return {
        success: true,
        message: 'Old files cleaned up successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Cleanup error: ${errorMessage}`);
      throw new HttpException('Failed to cleanup files', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
