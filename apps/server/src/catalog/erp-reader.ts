import ExcelJS from 'exceljs';
import { PART_NUMBER_MAX_LENGTH, PRICE_SCALE, parsePriceText } from '@bow/shared';
import { erpColumnMapping, type ErpField } from './erp-mapping.ts';

/**
 * Reads the ERP spreadsheet into rows the store can load and rows it cannot,
 * each with its reason (story-01-01 c3, c4; T-14). Nothing here guesses: a
 * price is loaded only if it is a plain positive number, and a part number that
 * appears more than once refuses every row carrying it.
 */

export interface LoadableRow {
  rowNumber: number;
  partNumber: string;
  description: string;
  price: number;
}

export interface RejectedRow {
  rowNumber: number;
  rawPartNumber: string | null;
  rawPrice: string | null;
  reason: string;
}

export interface ErpReadResult {
  /** Product rows in the ERP: every non-empty row below the heading row. */
  rowsRead: number;
  loadable: LoadableRow[];
  rejected: RejectedRow[];
}

export class ErpFileRefused extends Error {}

/**
 * One rule for both ways into the store (FDE decision, 2026-09-26, critique
 * Q2): the load refuses what the add-product screen refuses — a blank
 * description, or a part number over the screen's limit. The limit itself is
 * provisional until it is set from the longest part number in the real ERP.
 */
const MAX_PART_NUMBER_LENGTH = PART_NUMBER_MAX_LENGTH;

type CellValue = ExcelJS.CellValue;

function isFormula(value: CellValue): value is ExcelJS.CellFormulaValue | ExcelJS.CellSharedFormulaValue {
  return typeof value === 'object' && value !== null && ('formula' in value || 'sharedFormula' in value);
}

function isError(value: CellValue): value is ExcelJS.CellErrorValue {
  return typeof value === 'object' && value !== null && 'error' in value;
}

/** The text a person sees in the cell, for reasons and for the summary. */
function rawText(value: CellValue): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  if (isError(value)) return value.error;
  if (isFormula(value)) return `=${'formula' in value ? value.formula : value.sharedFormula}`;
  if ('richText' in value) return value.richText.map((part) => part.text).join('');
  if ('text' in value) return String(value.text);
  return null;
}

/** A text field whose cell the reader cannot show exactly as the ERP does. */
type CannotShow = { cannotShow: string };

function cannotShow(value: unknown): value is CannotShow {
  return typeof value === 'object' && value !== null && 'cannotShow' in value;
}

/**
 * A part number or description held as a number is read as the ERP shows it —
 * 1.10 stays "1.10", 00123 stays "00123" — so a lookup by what the ERP shows
 * finds the product (adversarial review, story-01-01 c2). Where the reader
 * cannot be sure what the ERP shows (another number format, a date), the row
 * is listed as not loaded with the reason, so a mismatch always reaches the
 * summary instead of loading under a different part number (round 2).
 */
function displayed(cell: ExcelJS.Cell, field: string): CellValue | CannotShow {
  const value = cell.value;
  if (value instanceof Date) return { cannotShow: `${field} is a date` };
  if (typeof value !== 'number') return value;
  const shown = formatAsShown(value, cell.numFmt);
  return shown ?? { cannotShow: `${field} is a number formatted "${cell.numFmt ?? 'General'}", which the load cannot show as the ERP does` };
}

/**
 * The number formats a part-number column plausibly uses and the reader can
 * render exactly as Excel does: General, zero padding ("00000") and fixed
 * decimals ("0.00"). Rounds the way Excel displays, at 15 significant digits.
 * Anything else, including negative numbers, returns null.
 */
function formatAsShown(value: number, numFmt: string | undefined): string | null {
  if (!Number.isFinite(value) || value < 0 || value >= 1e15) return null;
  const format = numFmt ?? 'General';
  if (format === 'General') {
    const text = String(Number(value.toPrecision(15)));
    return /e/i.test(text) ? null : text;
  }
  const plain = /^(0+)(?:\.(0+))?$/.exec(format);
  if (!plain) return null;
  const decimals = plain[2]?.length ?? 0;
  const scaled = Math.round(Number((value * 10 ** decimals).toPrecision(15)));
  const digits = String(scaled).padStart(decimals + 1, '0');
  const whole = digits.slice(0, digits.length - decimals).padStart(plain[1]!.length, '0');
  return decimals === 0 ? whole : `${whole}.${digits.slice(digits.length - decimals)}`;
}

function isBlank(value: CellValue): boolean {
  const text = rawText(value);
  return text === null || text.trim() === '';
}

type TextRead = { ok: true; text: string } | { ok: false; reason: string };

function readText(value: CellValue | CannotShow, field: string): TextRead {
  if (cannotShow(value)) return { ok: false, reason: value.cannotShow };
  if (isFormula(value)) return { ok: false, reason: `${field} is a formula` };
  if (isError(value)) return { ok: false, reason: `${field} is an error value: "${value.error}"` };
  return { ok: true, text: (rawText(value) ?? '').trim() };
}

type PriceRead = { ok: true; price: number } | { ok: false; reason: string };

function readPrice(value: CellValue): PriceRead {
  if (value === null || value === undefined) return { ok: false, reason: 'no price' };
  if (isFormula(value)) return { ok: false, reason: 'price is a formula' };
  if (isError(value)) return { ok: false, reason: `price is an error value: "${value.error}"` };
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return { ok: false, reason: `price is not positive: "${value}"` };
    const scaled = value * PRICE_SCALE;
    const rounded = Math.round(scaled);
    if (Math.abs(scaled - rounded) > 1e-6 * Math.max(1, Math.abs(scaled))) {
      return { ok: false, reason: `price has more than 4 decimal places: "${value}"` };
    }
    if (rounded <= 0) return { ok: false, reason: `price is not positive: "${value}"` };
    if (!Number.isSafeInteger(rounded)) return { ok: false, reason: `price is too large: "${value}"` };
    return { ok: true, price: rounded };
  }
  if (typeof value === 'string' || (typeof value === 'object' && 'richText' in value)) {
    const parsed = parsePriceText(rawText(value) ?? '');
    return parsed.ok ? { ok: true, price: parsed.tenThousandths } : { ok: false, reason: parsed.reason };
  }
  return { ok: false, reason: `price is not a plain number: "${rawText(value)}"` };
}

function normalisedPartNumber(partNumber: string): string {
  return partNumber.trim().toLowerCase();
}

export async function readErpWorkbook(buffer: Buffer | ArrayBuffer): Promise<ErpReadResult> {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as ArrayBuffer);
  } catch {
    throw new ErpFileRefused('The file is not an Excel workbook (.xlsx).');
  }
  // The load reads one worksheet. A workbook with data on more than one is
  // refused whole rather than read in part, because a product on a second tab
  // would otherwise be missing and listed nowhere (senior review R-1).
  const withData = workbook.worksheets.filter((ws) => {
    let found = false;
    ws.eachRow((row) => {
      if (rowHasText(row)) found = true;
    });
    return found;
  });
  if (withData.length > 1) {
    const names = withData.map((ws) => `"${ws.name}"`).join(', ');
    throw new ErpFileRefused(
      `The workbook has data on ${withData.length} worksheets (${names}). The load reads one worksheet, so nothing was loaded. Save the price list as a workbook with one worksheet and load that.`,
    );
  }
  const sheet = withData[0] ?? workbook.worksheets[0];
  if (!sheet) throw new ErpFileRefused('The workbook has no worksheet.');

  let headingRow: number | null = null;
  const columns: Partial<Record<ErpField, number>> = {};
  const repeated = new Set<string>();
  for (let r = 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    if (!row.hasValues) continue;
    headingRow = r;
    row.eachCell((cell, col) => {
      const heading = (rawText(cell.value) ?? '').trim().toLowerCase();
      for (const [field, names] of Object.entries(erpColumnMapping) as [ErpField, readonly string[]][]) {
        if (!names.includes(heading)) continue;
        // A heading that appears twice means a second table beside the first,
        // which the load would not read: refuse rather than miss it (round 2).
        if (columns[field] !== undefined) repeated.add(names[0]!);
        else columns[field] = col;
      }
    });
    break;
  }
  if (headingRow === null) throw new ErpFileRefused('The first worksheet is empty.');
  if (repeated.size > 0) {
    const names = [...repeated].map((n) => `"${n}"`).join(', ');
    throw new ErpFileRefused(
      `The heading row (row ${headingRow}) has more than one column headed ${names}. The load reads one table, so nothing was loaded.`,
    );
  }
  const missing = (Object.keys(erpColumnMapping) as ErpField[]).filter((f) => columns[f] === undefined);
  if (missing.length > 0) {
    const names = missing.map((f) => `"${erpColumnMapping[f][0]}"`).join(', ');
    throw new ErpFileRefused(`The heading row (row ${headingRow}) has no column headed ${names}. Nothing was loaded.`);
  }

  type Candidate = { rowNumber: number; rawPartNumber: string | null; rawPrice: string | null; reasons: string[]; row?: LoadableRow; key?: string };
  const candidates: Candidate[] = [];

  for (let r = headingRow + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const partCell = displayed(row.getCell(columns.partNumber!), 'part number');
    const descriptionCell = displayed(row.getCell(columns.description!), 'description');
    const priceCell = row.getCell(columns.price!).value;
    // A row with nothing in any cell is not a product row; a row with anything
    // in any cell is, and is either loaded or listed with its reason.
    if (!rowHasText(row)) continue;

    const reasons: string[] = [];
    const part = readText(partCell, 'part number');
    let partNumber: string | null = null;
    if (!part.ok) reasons.push(part.reason);
    else if (part.text === '') reasons.push('no part number');
    else if (part.text.length > MAX_PART_NUMBER_LENGTH) reasons.push(`part number is longer than ${MAX_PART_NUMBER_LENGTH} characters`);
    else partNumber = part.text;

    const description = readText(descriptionCell, 'description');
    if (!description.ok) reasons.push(description.reason);
    else if (description.text === '') reasons.push('no description');

    const price = readPrice(priceCell);
    if (!price.ok) reasons.push(price.reason);

    const candidate: Candidate = { rowNumber: r, rawPartNumber: rawText(row.getCell(columns.partNumber!).value), rawPrice: rawText(priceCell), reasons };
    if (partNumber !== null) candidate.key = normalisedPartNumber(partNumber);
    if (reasons.length === 0 && partNumber !== null && description.ok && price.ok) {
      candidate.row = { rowNumber: r, partNumber, description: description.text, price: price.price };
    }
    candidates.push(candidate);
  }

  // A part number that appears more than once refuses every row carrying it,
  // whatever the prices (story-01-01 c4; the FDE's decision of 2026-09-26 for
  // identical prices). Compared ignoring case and surrounding spaces, the same
  // way the store compares part numbers.
  const seen = new Map<string, number>();
  for (const c of candidates) if (c.key) seen.set(c.key, (seen.get(c.key) ?? 0) + 1);
  for (const c of candidates) {
    if (c.key && (seen.get(c.key) ?? 0) > 1) c.reasons.unshift('duplicate part number');
  }

  const loadable: LoadableRow[] = [];
  const rejected: RejectedRow[] = [];
  for (const c of candidates) {
    if (c.reasons.length === 0 && c.row) loadable.push(c.row);
    else rejected.push({ rowNumber: c.rowNumber, rawPartNumber: c.rawPartNumber, rawPrice: c.rawPrice, reason: c.reasons.join('; ') });
  }
  return { rowsRead: candidates.length, loadable, rejected };
}

function rowHasText(row: ExcelJS.Row): boolean {
  let found = false;
  row.eachCell((cell) => {
    if (!isBlank(cell.value)) found = true;
  });
  return found;
}
