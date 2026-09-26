import 'reflect-metadata';
import ExcelJS from 'exceljs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { LocalClock } from '../src/adapters/clock.ts';
import { LocalSignIn, type Audience } from '../src/adapters/sign-in.ts';
import { createApp } from '../src/app.ts';
import { readConfig } from '../src/config.ts';
import { openDatabase, type Db } from '../src/db/database.ts';
import { DevModule } from '../src/dev/dev.module.ts';
import { localDirectory } from '../src/seed/people.ts';
import { seed } from '../src/seed/seed.ts';
import type BetterSqlite3 from 'better-sqlite3';

export const INDEX_HTML = '<!doctype html><title>Bow Reseller Portal</title><div id="root"></div>';

export interface Response {
  status: number;
  body: string;
  json: any;
  headers: Record<string, unknown>;
}

export interface Portal {
  app: NestFastifyApplication;
  db: Db;
  raw: BetterSqlite3.Database;
  clock: LocalClock;
  /** Signs in as someone in the local directory, the way /dev/sign-in does. */
  signIn(subjectId: string, audience?: Audience): Promise<Client>;
  /** A caller with no session at all. */
  anonymous(): Client;
  internalUserId(subjectId: string): Promise<number>;
  close(): Promise<void>;
}

export interface Client {
  cookie: string | null;
  csrfToken: string | null;
  get(url: string): Promise<Response>;
  post(url: string, body?: unknown, options?: { csrf?: boolean }): Promise<Response>;
  delete(url: string, options?: { csrf?: boolean }): Promise<Response>;
  upload(url: string, fileName: string, content: Buffer, options?: { csrf?: boolean }): Promise<Response>;
}

function toResponse(result: { statusCode: number; body: string; headers: Record<string, unknown> }): Response {
  let json: unknown = undefined;
  try {
    json = result.body ? JSON.parse(result.body) : undefined;
  } catch {
    json = undefined;
  }
  return { status: result.statusCode, body: result.body, json, headers: result.headers };
}

export async function startPortal(options: { devPages?: boolean } = {}): Promise<Portal> {
  const dir = mkdtempSync(join(tmpdir(), 'bow-portal-test-'));
  const { db, raw } = openDatabase(join(dir, 'portal.db'));
  const clock = new LocalClock();
  await seed(db, clock);
  const app = await createApp({
    config: readConfig({}),
    db,
    clock,
    signIn: new LocalSignIn(localDirectory()),
    indexHtml: INDEX_HTML,
    devModule: options.devPages === false ? undefined : DevModule,
    logger: false,
  });
  const fastify = app.getHttpAdapter().getInstance();

  const client = (cookie: string | null, csrfToken: string | null): Client => {
    const headers = (csrf = true): Record<string, string> => ({
      ...(cookie ? { cookie } : {}),
      ...(csrf && csrfToken ? { 'x-csrf-token': csrfToken } : {}),
    });
    return {
      cookie,
      csrfToken,
      get: async (url) => toResponse(await fastify.inject({ method: 'GET', url, headers: headers() })),
      post: async (url, body, options) =>
        toResponse(
          await fastify.inject({
            method: 'POST',
            url,
            headers: { ...headers(options?.csrf ?? true), 'content-type': 'application/json' },
            payload: JSON.stringify(body ?? {}),
          }),
        ),
      delete: async (url, options) => toResponse(await fastify.inject({ method: 'DELETE', url, headers: headers(options?.csrf ?? true) })),
      upload: async (url, fileName, content, options) => {
        const boundary = '----bow-test-boundary';
        const payload = Buffer.concat([
          Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
              'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n',
          ),
          content,
          Buffer.from(`\r\n--${boundary}--\r\n`),
        ]);
        return toResponse(
          await fastify.inject({
            method: 'POST',
            url,
            headers: { ...headers(options?.csrf ?? true), 'content-type': `multipart/form-data; boundary=${boundary}` },
            payload,
          }),
        );
      },
    };
  };

  return {
    app,
    db,
    raw,
    clock,
    anonymous: () => client(null, null),
    async signIn(subjectId, audience) {
      const who = audience ?? (subjectId.startsWith('local-reseller-') ? 'reseller' : 'staff');
      const result = await fastify.inject({
        method: 'POST',
        url: '/dev/api/sign-in',
        headers: { 'content-type': 'application/json' },
        payload: JSON.stringify({ audience: who, subjectId }),
      });
      if (result.statusCode !== 204) throw new Error(`Sign-in as ${subjectId} failed: ${result.statusCode} ${result.body}`);
      const setCookie = String(result.headers['set-cookie']);
      const cookie = setCookie.split(';')[0]!;
      const session = toResponse(await fastify.inject({ method: 'GET', url: '/api/session', headers: { cookie } }));
      return client(cookie, session.json.csrfToken);
    },
    async internalUserId(subjectId) {
      const row = await db.selectFrom('internal_user').select('internal_user_id').where('entra_object_id', '=', subjectId).executeTakeFirstOrThrow();
      return row.internal_user_id;
    },
    async close() {
      await app.close();
      await db.destroy();
    },
  };
}

/** A hand-built ERP workbook: a heading row, then the given rows. */
export async function workbook(rows: ExcelJS.CellValue[][], heading: string[] = ['Part number', 'Description', 'Price']): Promise<Buffer> {
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet('ERP');
  sheet.addRow(heading);
  for (const row of rows) sheet.addRow(row);
  return Buffer.from(await book.xlsx.writeBuffer());
}

export const PAT = 'local-staff-pat';
export const SAM = 'local-staff-sam';
export const ALEX = 'local-staff-alex';
export const LEE = 'local-staff-lee';
export const JO = 'local-staff-jo';
export const MORGAN = 'local-staff-morgan';
export const CHRIS = 'local-staff-chris';
export const CASEY = 'local-reseller-a-casey';
