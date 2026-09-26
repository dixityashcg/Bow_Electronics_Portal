/**
 * QA harness for epic-01 — independent of the build's own test harness.
 *
 * Every case runs against a real portal process (apps/server/src/main.ts, the
 * same entry point scripts/dev.sh starts) on its own SQLite file seeded by the
 * project's own seed command, and talks to it over HTTP exactly as the browser
 * application does. Every exchange and every check is written to
 * engagement/epics/epic-01/evidence/<case>/.
 */
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync, openSync } from 'node:fs';
import { resolve, join } from 'node:path';
import Database from 'better-sqlite3';
import ExcelJS from 'exceljs';

export const ROOT = resolve(import.meta.dirname, '../../../..');
export const SERVER = join(ROOT, 'apps/server');
export const TSX = join(ROOT, 'node_modules/.bin/tsx');
export const EVIDENCE = join(ROOT, 'engagement/epics/epic-01/evidence');
export const WORK = process.env.QA_WORK_DIR ?? join(ROOT, '.local/qa-epic-01');

mkdirSync(WORK, { recursive: true });
mkdirSync(EVIDENCE, { recursive: true });

// ---------------------------------------------------------------- evidence

export interface Check { name: string; pass: boolean; detail: string }

export class Evidence {
  http: unknown[] = [];
  checks: Check[] = [];
  notes: string[] = [];
  started = new Date().toISOString();
  constructor(public caseId: string, public title: string) {}
  check(name: string, pass: boolean, detail: unknown = ''): boolean {
    this.checks.push({ name, pass, detail: typeof detail === 'string' ? detail : JSON.stringify(detail) });
    return pass;
  }
  note(text: string) { this.notes.push(text); }
  get passed() { return this.checks.length > 0 && this.checks.every((c) => c.pass); }
  save(extra: Record<string, unknown> = {}) {
    const dir = join(EVIDENCE, this.caseId);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'http-log.json'), JSON.stringify(this.http, null, 2));
    const lines = [
      `# ${this.caseId} — ${this.title}`,
      '',
      `Executed ${this.started} → ${new Date().toISOString()} · result **${this.passed ? 'PASS' : 'FAIL'}**`,
      '',
      '| Check | Result | Observed |',
      '|---|---|---|',
      ...this.checks.map((c) => `| ${c.name.replace(/\|/g, '\\|')} | ${c.pass ? 'pass' : 'FAIL'} | ${c.detail.replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 1500)} |`),
      '',
      ...(this.notes.length ? ['## Notes', '', ...this.notes.map((n) => `- ${n}`), ''] : []),
      `HTTP exchanges: ${this.http.length} (http-log.json).`,
    ];
    writeFileSync(join(dir, 'checks.md'), lines.join('\n') + '\n');
    for (const [name, value] of Object.entries(extra)) {
      writeFileSync(join(dir, name), typeof value === 'string' ? value : JSON.stringify(value, null, 2));
    }
    return this.passed;
  }
}

let current: Evidence | null = null;
export function useEvidence(ev: Evidence | null) { current = ev; }

// ---------------------------------------------------------------- portal

let nextPort = 3301;

export class Portal {
  proc: ChildProcess | null = null;
  port: number;
  dbFile: string;
  logFile: string;
  constructor(public name: string) {
    this.port = nextPort++;
    this.dbFile = join(WORK, `${name}.db`);
    this.logFile = join(WORK, `${name}.log`);
  }
  get base() { return `http://localhost:${this.port}`; }
  env(extra: Record<string, string> = {}) {
    return {
      ...process.env,
      PORTAL_MODE: 'local',
      PORTAL_PUBLIC_URL: `http://localhost:${this.port}`,
      PORT: String(this.port),
      SIGN_IN_ADAPTER: 'local',
      DATABASE_ADAPTER: 'local',
      EMAIL_ADAPTER: 'local',
      CLOCK_ADAPTER: 'local',
      DATABASE_FILE: this.dbFile,
      WEB_DIST_DIR: join(ROOT, 'apps/web/dist'),
      ...extra,
    };
  }
  async start() {
    for (const f of [this.dbFile, `${this.dbFile}-wal`, `${this.dbFile}-shm`]) if (existsSync(f)) rmSync(f);
    const seeded = spawnSync(TSX, ['src/cli/seed.ts'], { cwd: SERVER, env: this.env(), encoding: 'utf8' });
    if (seeded.status !== 0) throw new Error(`seed failed: ${seeded.stderr}`);
    const out = openSync(this.logFile, 'w');
    this.proc = spawn(TSX, ['src/main.ts'], { cwd: SERVER, env: this.env(), stdio: ['ignore', out, out], detached: true });
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      try {
        const r = await fetch(`${this.base}/api/session`);
        if (r.ok) return this;
      } catch { /* not up yet */ }
      await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error(`portal ${this.name} did not start; see ${this.logFile}`);
  }
  stop() {
    if (this.proc?.pid) {
      try { process.kill(-this.proc.pid, 'SIGTERM'); } catch { /* gone */ }
    }
    this.proc = null;
  }
  /** The database as the system holds it, read with the application's own driver. */
  db(readonly = true) { return new Database(this.dbFile, { readonly, fileMustExist: true }); }
  query<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
    const db = this.db();
    try { return db.prepare(sql).all(...params) as T[]; } finally { db.close(); }
  }
}

// ---------------------------------------------------------------- client

export interface Answer { status: number; headers: Record<string, string>; text: string; json: any; ms: number }

export class Client {
  cookie: string | null = null;
  csrf: string | null = null;
  constructor(public portal: Portal, public who: string) {}

  static async as(portal: Portal, who: string, subjectId: string, audience: 'staff' | 'reseller' = 'staff') {
    const c = new Client(portal, who);
    const a = await c.req('POST', '/dev/api/sign-in', { json: { audience, subjectId }, csrf: false });
    if (a.status !== 204) return Object.assign(c, { signInAnswer: a });
    const s = await c.req('GET', '/api/session');
    c.csrf = s.json?.csrfToken ?? null;
    return Object.assign(c, { signInAnswer: a });
  }

  async req(
    method: string,
    path: string,
    opts: { json?: unknown; form?: FormData; csrf?: boolean | string; headers?: Record<string, string>; redirect?: 'manual' | 'follow'; log?: boolean } = {},
  ): Promise<Answer> {
    const headers: Record<string, string> = { ...(opts.headers ?? {}) };
    if (this.cookie) headers.cookie = this.cookie;
    let body: BodyInit | undefined;
    if (opts.json !== undefined) { headers['content-type'] = 'application/json'; body = JSON.stringify(opts.json); }
    if (opts.form) body = opts.form;
    const wantCsrf = opts.csrf ?? method !== 'GET';
    if (typeof wantCsrf === 'string') headers['x-csrf-token'] = wantCsrf;
    else if (wantCsrf && this.csrf) headers['x-csrf-token'] = this.csrf;
    const t0 = performance.now();
    const r = await fetch(this.portal.base + path, { method, headers, body, redirect: opts.redirect ?? 'manual' });
    const text = await r.text();
    const ms = performance.now() - t0;
    const setCookie = r.headers.get('set-cookie');
    if (setCookie) {
      const m = /bow_session=([^;]*)/.exec(setCookie);
      if (m) this.cookie = m[1] ? `bow_session=${m[1]}` : null;
    }
    let json: any = null;
    try { json = JSON.parse(text); } catch { /* not JSON */ }
    const answer: Answer = { status: r.status, headers: Object.fromEntries(r.headers.entries()), text, json, ms };
    if (current && opts.log !== false) {
      current.http.push({
        at: new Date().toISOString(),
        who: this.who,
        request: { method, path, headers: { ...headers, cookie: headers.cookie ? 'bow_session=<redacted>' : undefined }, body: opts.form ? '<multipart file>' : opts.json },
        response: { status: r.status, headers: answer.headers, body: text.length > 3000 ? text.slice(0, 3000) + `… (${text.length} chars)` : text },
        ms: Math.round(ms * 10) / 10,
      });
    }
    return answer;
  }

  async load(buffer: Buffer | Uint8Array, fileName = 'erp.xlsx') {
    const form = new FormData();
    form.append('file', new Blob([buffer]), fileName);
    return this.req('POST', '/api/sales/store/load', { form });
  }
}

// ---------------------------------------------------------------- workbooks

export type CellValue = string | number | null | { formula: string } | { error: '#REF!' | '#N/A' | '#VALUE!' };
export const HEADING = ['Part number', 'Description', 'Price'];

export async function workbook(rows: CellValue[][], heading: string[] = HEADING): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('ERP');
  ws.addRow(heading);
  for (const row of rows) ws.addRow(row as any[]);
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export interface ErpRow { rowNumber: number; partNumber: string; description: string; price: unknown; priceText: string; cells: unknown[] }

/** Reads an ERP workbook independently of the portal's reader: first worksheet, first non-empty row is the heading. */
export async function readErp(file: string): Promise<{ rows: ErpRow[]; heading: string[] }> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const ws = wb.worksheets[0]!;
  let heading: string[] | null = null;
  let col = { pn: 0, desc: 0, price: 0 };
  const rows: ErpRow[] = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const cells = (row.values as unknown[]).slice(1);
    const nonEmpty = cells.some((c) => c !== null && c !== undefined && String(typeof c === 'object' ? JSON.stringify(c) : c).trim() !== '');
    if (!nonEmpty) return;
    if (!heading) {
      heading = cells.map((c) => String(c ?? '').trim());
      const idx = (h: string) => heading!.findIndex((x) => x.toLowerCase() === h) + 1;
      col = { pn: idx('part number'), desc: idx('description'), price: idx('price') };
      return;
    }
    const v = (i: number) => row.getCell(i).value;
    const price = v(col.price);
    rows.push({
      rowNumber,
      partNumber: row.getCell(col.pn).text,
      description: row.getCell(col.desc).text,
      price,
      priceText: row.getCell(col.price).text,
      cells,
    });
  });
  return { rows, heading: heading ?? [] };
}

/** A price as the ERP shows it, in ten-thousandths, or null when it is not a plain number. */
export function priceUnits(value: unknown): number | null {
  if (typeof value === 'number') return Math.round(value * 10_000);
  if (typeof value === 'string' && /^\s*\d+(\.\d{1,4})?\s*$/.test(value)) {
    const [w, f = ''] = value.trim().split('.');
    return Number(w) * 10_000 + Number(f.padEnd(4, '0'));
  }
  return null;
}

export function pct(values: number[], p: number) {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)]!;
}
