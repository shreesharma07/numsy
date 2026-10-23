/**
 * Dashboard REST API: parse → export with settings, analyze, meta, errors
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as ExcelJS from 'exceljs';
import request from 'supertest';
import { AppModule } from '../src/app.module';

const CSV = [
  'Name,Mobile,City',
  'Asha,9876501234,Pune',
  'Ravi,+91 98765 01234,Delhi',
  'Meera,9999999999,Agra',
  'John,,Goa',
].join('\n');

const binary = (res: request.Response, done: (err: Error | null, body: Buffer) => void) => {
  const chunks: Buffer[] = [];
  res.on('data', (chunk: Buffer) => chunks.push(chunk));
  res.on('end', () => done(null, Buffer.concat(chunks)));
};

describe('Dashboard API', () => {
  let app: INestApplication;
  let sessionId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('describes itself', async () => {
    const res = await request(app.getHttpServer()).get('/api/meta').expect(200);
    expect(res.body).toMatchObject({ name: 'numsy', mode: 'local' });
    expect(res.body.formats.map((f: { id: string }) => f.id)).toEqual([
      'json',
      'csv',
      'md',
      'txt',
      'xlsx',
    ]);
  });

  it('parses an upload in memory and detects columns', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/parse')
      .attach('file', Buffer.from(CSV), 'leads.csv')
      .expect(200);
    expect(res.body).toMatchObject({
      fileName: 'leads.csv',
      totalRows: 4,
      columns: ['Name', 'Mobile', 'City'],
      detected: { phoneColumn: 'Mobile', nameColumn: 'Name' },
    });
    expect(res.body.rows).toBeUndefined();
    sessionId = res.body.sessionId;
  });

  it('serves paged, searchable views that follow the settings', async () => {
    const view = (settings: object, query: object = {}) =>
      request(app.getHttpServer())
        .post('/api/view')
        .send({ sessionId, settings, query })
        .expect(200);

    const all = await view({});
    expect(all.body.counts).toEqual({ all: 4, valid: 2, invalid: 2, unique: 1, duplicates: 1 });
    expect(all.body.rows.map((r: any) => r.status)).toEqual([
      'valid',
      'duplicate',
      'invalid',
      'invalid',
    ]);
    expect(all.body.columns.map((c: any) => c.label)).toEqual([
      'Name',
      'Mobile',
      'number',
      'reason',
    ]);

    const deduped = await view({ dedupe: 'first', numberStyle: 'e164', only: 'valid' });
    expect(deduped.body.counts.valid).toBe(1);
    expect(deduped.body.rows[0].cells.sanitizedPhone).toBe('+919876501234');
    expect(deduped.body.summary['Duplicates removed']).toBe(1);

    const paged = await view({}, { page: 2, pageSize: 3 });
    expect(paged.body).toMatchObject({ page: 2, pages: 2, total: 4 });
    expect(paged.body.rows.map((r: any) => r.n)).toEqual([4]);

    const searched = await view({}, { search: 'meera', allColumns: true });
    expect(searched.body.total).toBe(1);
    expect(searched.body.rows[0].cells.City).toBe('Agra');
  });

  it('opens text sessions for pasted values', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/text')
      .send({ text: '9876501234\n98765 01234\nabc', mode: 'validate' })
      .expect(200);
    const view = await request(app.getHttpServer())
      .post('/api/view')
      .send({ sessionId: res.body.sessionId, settings: {} })
      .expect(200);
    expect(view.body.counts).toMatchObject({ all: 3, valid: 2, invalid: 1, duplicates: 1 });
  });

  it('exports the parsed upload with de-duplication and number style', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/export')
      .send({
        sessionId,
        format: 'csv',
        settings: { dedupe: 'first', only: 'valid', numberStyle: 'spaced' },
      })
      .expect(200);
    expect(res.headers['content-disposition']).toBe('attachment; filename="leads-valid.csv"');
    expect(res.headers['x-numsy-rows']).toBe('1');
    expect(res.text).toContain('+91 98765 01234');
    expect(res.text).not.toContain('Ravi');
  });

  it('applies the output settings to exports', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/export')
      .send({
        sessionId,
        format: 'csv',
        settings: { only: 'unique', columns: 'numbers', numberHeader: 'Mobile', header: false },
      })
      .expect(200);
    expect(res.text).toBe('Asha,9876501234\r\n');
  });

  it('exports a multi-sheet workbook', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/export')
      .send({ sessionId, format: 'xlsx' })
      .buffer(true)
      .parse(binary)
      .expect(200);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(res.body as any);
    expect(workbook.worksheets.map((s) => s.name)).toEqual([
      'Summary',
      'All rows',
      'Valid',
      'Invalid',
      'Unique',
      'Duplicates',
    ]);
  });

  it('exports pasted text', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/export')
      .send({ text: 'Call 98765 01234 or 9123456789', mode: 'extract', format: 'txt' })
      .expect(200);
    expect(res.text).toBe('9876501234\n9123456789\n');
  });

  it('analyses an upload in one call with settings fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/analyze')
      .field('strict', 'false')
      .field('skipEmpty', 'true')
      .attach('file', Buffer.from(CSV), 'leads.csv')
      .expect(200);
    expect(res.body.validRows).toHaveLength(3);
    expect(res.body.invalidRows).toHaveLength(0);
    expect(res.body.analytics.emptyRecords).toBe(1);
  });

  it('rejects bad input with clear messages', async () => {
    const server = app.getHttpServer();
    await request(server)
      .post('/api/parse')
      .attach('file', Buffer.from('x'), 'notes.txt')
      .expect(400);
    await request(server)
      .post('/api/export')
      .send({ sessionId: 'missing', format: 'csv' })
      .expect(404);
    await request(server).post('/api/export').send({ sessionId, format: 'pdf' }).expect(400);
    const bad = await request(server)
      .post('/api/analyze')
      .field('phoneColumn', 'Nope')
      .attach('file', Buffer.from(CSV), 'leads.csv')
      .expect(400);
    expect(bad.body.message).toMatch(/Column "Nope" not found/);
  });

  it('forgets a session', async () => {
    await request(app.getHttpServer()).delete(`/api/session/${sessionId}`).expect(204);
    await request(app.getHttpServer())
      .post('/api/export')
      .send({ sessionId, format: 'csv' })
      .expect(404);
  });
});
