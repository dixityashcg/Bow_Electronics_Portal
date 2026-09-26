import ExcelJS from 'exceljs';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { buildSampleErp, type SampleErpFacts } from '../src/seed/sample-erp.ts';
import { PAT, SAM, startPortal, workbook, type Client, type Portal } from './harness.ts';

/**
 * story-01-01 — Load the Excel ERP into the store and confirm nothing is missing.
 *
 * The sample spreadsheet's facts (how many product rows, which are good, which
 * are bad and why) come from the generator, not from the loader under test.
 */

const LOAD = '/api/sales/store/load';
const lookup = (pn: string) => `/api/sales/store/part-numbers/${encodeURIComponent(pn)}`;

async function productCount(portal: Portal): Promise<number> {
  const row = await portal.db.selectFrom('product').select((eb) => eb.fn.countAll<number>().as('n')).executeTakeFirstOrThrow();
  return Number(row.n);
}

describe('the sample ERP spreadsheet, loaded through the real load', () => {
  let portal: Portal;
  let pat: Client;
  let facts: SampleErpFacts;
  let summary: any;

  beforeAll(async () => {
    portal = await startPortal();
    pat = await portal.signIn(PAT);
    const sample = await buildSampleErp();
    facts = sample.facts;
    const response = await pat.upload(LOAD, 'sample-erp.xlsx', Buffer.from(await sample.workbook.xlsx.writeBuffer()));
    expect(response.status).toBe(201);
    summary = response.json.summary;
  });
  afterAll(async () => {
    await portal?.close();
  });

  test('[story-01-01#1] the number loaded plus the number not loaded equals the product rows in the ERP', async () => {
    expect(facts.productRows).toBeGreaterThan(2000);
    expect(summary.rowsInErp).toBe(facts.productRows);
    expect(summary.rowsLoaded + summary.rowsNotLoaded).toBe(facts.productRows);
    expect(summary.notLoaded).toHaveLength(summary.rowsNotLoaded);
    expect(summary.rowsLoaded).toBe(facts.good.length);
    expect(await productCount(portal)).toBe(summary.rowsLoaded);
    // The summary reads back the same when opened later.
    const reopened = await pat.get('/api/sales/store/load-summary');
    expect(reopened.json.summary.rowsInErp).toBe(facts.productRows);
    expect(reopened.json.summary.rowsLoaded + reopened.json.summary.rowsNotLoaded).toBe(facts.productRows);
  });

  test('[story-01-01#2] a part number looked up after the load matches the ERP row: part number, description, price, and Open', async () => {
    // 20 rows picked at random (fixed seed, so a failure can be repeated), plus the first and last.
    let seed = 7;
    const nextIndex = () => {
      seed = (seed * 1103515245 + 12345) % 2 ** 31;
      return seed % facts.good.length;
    };
    const picked = [facts.good[0]!, facts.good.at(-1)!, ...Array.from({ length: 20 }, () => facts.good[nextIndex()]!)];
    for (const row of picked) {
      const found = await pat.get(lookup(row.partNumber));
      expect(found.status, row.partNumber).toBe(200);
      expect(found.json).toMatchObject({
        partNumber: row.partNumber,
        description: row.description,
        price: row.price,
        status: 'Open for quoting',
      });
    }
    // The full part number is found whatever its case.
    const lower = await pat.get(lookup(picked[0]!.partNumber.toLowerCase()));
    expect(lower.json.partNumber).toBe(picked[0]!.partNumber);
  });

  test('[story-01-01#3] rows with no part number or no price are listed as not loaded, with the reason', async () => {
    const reasonFor = (kind: string) => {
      const bad = facts.bad.find((b) => b.kind === kind)!;
      return summary.notLoaded.find((r: any) => r.rowNumber === bad.rowNumber)?.reason as string | undefined;
    };
    expect(reasonFor('no part number')).toBe('no part number');
    expect(reasonFor('no price')).toBe('no price');
    // The other price shapes T-14 names are listed too, each with its own reason.
    expect(reasonFor('dollar sign')).toBe('price is not a plain number: "$12"');
    expect(reasonFor('thousands separator')).toBe('price is not a plain number: "1,234.50"');
    expect(reasonFor('error value')).toBe('price is an error value: "#REF!"');
    expect(reasonFor('formula')).toBe('price is a formula');
    const noPrice = facts.bad.find((b) => b.kind === 'no price')!;
    const row = summary.notLoaded.find((r: any) => r.rowNumber === noPrice.rowNumber);
    expect((await pat.get(lookup(row.partNumber))).status).toBe(404);
  });

  test('[story-01-01#4] two rows with the same part number and different prices are both listed as not loaded, "duplicate part number"', async () => {
    const duplicates = facts.bad.filter((b) => b.kind === 'duplicate part number');
    expect(duplicates).toHaveLength(2);
    for (const d of duplicates) {
      const row = summary.notLoaded.find((r: any) => r.rowNumber === d.rowNumber);
      expect(row?.reason).toBe('duplicate part number');
    }
    const prices = duplicates.map((d) => summary.notLoaded.find((r: any) => r.rowNumber === d.rowNumber).price);
    expect(new Set(prices).size).toBe(2);
    expect((await pat.get(lookup('BWE-C0402X7R104K'))).status).toBe(404);
  });

  test('[story-01-01#5] a summary listing any row not loaded does not report the load as complete', async () => {
    expect(summary.rowsNotLoaded).toBeGreaterThan(0);
    expect(summary.complete).toBe(false);
    expect(summary.statusText).toMatch(/^Load not complete/);
    expect(summary.statusText).not.toMatch(/^Load complete/);
    const reopened = await pat.get('/api/sales/store/load-summary');
    expect(reopened.json.summary.complete).toBe(false);
    expect(reopened.json.summary.statusText).toMatch(/^Load not complete/);
  });

  test('the load runs once: a second load over a store holding products is refused and the store is unchanged (T-15)', async () => {
    const before = await productCount(portal);
    const again = await pat.upload(LOAD, 'again.xlsx', await workbook([['BWE-NEW-1', 'Anything', 1]]));
    expect(again.status).toBe(409);
    expect(await productCount(portal)).toBe(before);
    expect((await pat.get(lookup('BWE-NEW-1'))).status).toBe(404);
  });
});

describe('hand-built ERP files', () => {
  let portal: Portal;

  beforeAll(async () => {
    portal = await startPortal();
  });
  afterAll(async () => {
    await portal?.close();
  });

  async function freshLoad(rows: any[][]) {
    await portal.close();
    portal = await startPortal();
    const pat = await portal.signIn(PAT);
    const response = await pat.upload(LOAD, 'hand-built.xlsx', await workbook(rows));
    expect(response.status, response.body).toBe(201);
    return { pat, summary: response.json.summary };
  }

  test('[story-01-01#2] every field matches, including sub-cent, text-held and large prices', async () => {
    const { pat } = await freshLoad([
      ['BWE-C0402X7R104K', 'Capacitor, ceramic, 0.1 µF, 16 V, X7R, 0402', 0.004],
      ['  BWE-R0603-1K  ', 'Resistor, thick film, 1 kΩ, 1 %, 0603', '12.50'],
      ['BWE-MCU256K-1', 'Microcontroller, 32-bit, 240 MHz, 256 KB flash, LQFP-64', 180],
      ['BWE-Y16M-1', 'Crystal, 16 MHz, 10 ppm, 3.2 × 2.5 mm', 0.4567],
    ]);
    const expectations = [
      ['BWE-C0402X7R104K', 'Capacitor, ceramic, 0.1 µF, 16 V, X7R, 0402', 40, '0.0040'],
      ['BWE-R0603-1K', 'Resistor, thick film, 1 kΩ, 1 %, 0603', 125_000, '12.50'],
      ['BWE-MCU256K-1', 'Microcontroller, 32-bit, 240 MHz, 256 KB flash, LQFP-64', 1_800_000, '180.00'],
      ['BWE-Y16M-1', 'Crystal, 16 MHz, 10 ppm, 3.2 × 2.5 mm', 4567, '0.4567'],
    ] as const;
    for (const [partNumber, description, price, priceText] of expectations) {
      const found = await pat.get(lookup(partNumber));
      expect(found.json).toMatchObject({ partNumber, description, price, priceText, status: 'Open for quoting' });
    }
  });

  test('[story-01-01#3] zero, negative and over-precise prices, and a blank part number, are each listed with the reason', async () => {
    const { summary } = await freshLoad([
      ['BWE-OK-1', 'Good row', 1.5],
      [null, 'No part number at all', 2],
      ['   ', 'Part number of spaces', 2],
      ['BWE-ZERO', 'Zero price', 0],
      ['BWE-NEG', 'Negative price', -3],
      ['BWE-PRECISE', 'Five decimal places', 0.12345],
      ['BWE-BLANK', 'Blank price', ''],
      [null, null, null],
      ['BWE-OK-2', 'Good row', '7'],
    ]);
    const reasons = Object.fromEntries(summary.notLoaded.map((r: any) => [r.rowNumber, r.reason]));
    expect(reasons).toEqual({
      3: 'no part number',
      4: 'no part number',
      5: 'price is not positive: "0"',
      6: 'price is not positive: "-3"',
      7: 'price has more than 4 decimal places: "0.12345"',
      8: 'no price',
    });
    // The empty row is not a product row; the count identity still holds.
    expect(summary.rowsInErp).toBe(8);
    expect(summary.rowsLoaded).toBe(2);
    expect(summary.rowsLoaded + summary.rowsNotLoaded).toBe(summary.rowsInErp);
  });

  test('[story-01-01#4] a repeated part number refuses every row carrying it, whatever the prices, case or spacing', async () => {
    const { pat, summary } = await freshLoad([
      ['BWE-DUP-SAME', 'Same price', 1.25],
      ['BWE-DUP-SAME', 'Same price', 1.25],
      ['BWE-DUP-CASE', 'Differs by case', 2],
      ['bwe-dup-case ', 'Differs by case', 3],
      ['BWE-DUP-THREE', 'Three times', 1],
      ['BWE-DUP-THREE', 'Three times', 2],
      ['BWE-DUP-THREE', 'Three times, no price', null],
      ['BWE-SINGLE', 'Only once', 4],
    ]);
    const byRow = Object.fromEntries(summary.notLoaded.map((r: any) => [r.rowNumber, r.reason]));
    for (const row of [2, 3, 4, 5, 6, 7]) expect(byRow[row]).toBe('duplicate part number');
    expect(byRow[8]).toBe('duplicate part number; no price');
    expect(summary.rowsLoaded).toBe(1);
    for (const pn of ['BWE-DUP-SAME', 'BWE-DUP-CASE', 'BWE-DUP-THREE']) expect((await pat.get(lookup(pn))).status).toBe(404);
  });

  test('[story-01-01#5] a load with no row left behind is reported complete, and one with any is not', async () => {
    const clean = await freshLoad([['BWE-A', 'A', 1], ['BWE-B', 'B', 2]]);
    expect(clean.summary.complete).toBe(true);
    expect(clean.summary.statusText).toMatch(/^Load complete/);
    const oneBad = await freshLoad([['BWE-A', 'A', 1], ['BWE-B', 'B', '$2']]);
    expect(oneBad.summary.complete).toBe(false);
    expect(oneBad.summary.statusText).toMatch(/^Load not complete: 1 of 2/);
  });

  test('[story-01-01#1] a workbook with products on more than one worksheet is refused whole, so no product can go missing unlisted (review R-1)', async () => {
    await portal.close();
    portal = await startPortal();
    const pat = await portal.signIn(PAT);
    const book = new ExcelJS.Workbook();
    const a = book.addWorksheet('Passives');
    a.addRow(['Part number', 'Description', 'Price']);
    a.addRow(['BWE-A', 'Alpha', 1]);
    a.addRow(['BWE-B', 'Beta', 2]);
    const b = book.addWorksheet('Actives');
    b.addRow(['Part number', 'Description', 'Price']);
    b.addRow(['BWE-C', 'Gamma', 3]);
    book.addWorksheet('Empty notes');
    const response = await pat.upload(LOAD, 'two-sheets.xlsx', Buffer.from(await book.xlsx.writeBuffer()));
    expect(response.status).toBe(400);
    expect(response.json.message).toMatch(/data on 2 worksheets \("Passives", "Actives"\)/);
    expect(await productCount(portal)).toBe(0);
    expect((await pat.get('/api/sales/store/load-summary')).json.summary).toBeNull();
  });

  test('[story-01-01#2] a part number held as a number is stored as the ERP shows it, and found by that (review finding)', async () => {
    await portal.close();
    portal = await startPortal();
    const pat = await portal.signIn(PAT);
    const book = new ExcelJS.Workbook();
    const sheet = book.addWorksheet('ERP');
    sheet.addRow(['Part number', 'Description', 'Price']);
    sheet.addRow([1.1, 'Numeric part shown with two decimals', 2]).getCell(1).numFmt = '0.00';
    sheet.addRow([123, 'Numeric part shown with leading zeros', 3]).getCell(1).numFmt = '00000';
    sheet.addRow([4711, 'Plain numeric part', 4]);
    const response = await pat.upload(LOAD, 'numeric.xlsx', Buffer.from(await book.xlsx.writeBuffer()));
    expect(response.status, response.body).toBe(201);
    for (const [shown, description] of <[string, string][]>[['1.10', 'Numeric part shown with two decimals'], ['00123', 'Numeric part shown with leading zeros'], ['4711', 'Plain numeric part']]) {
      const found = await pat.get(lookup(shown));
      expect(found.status, shown).toBe(200);
      expect(found.json).toMatchObject({ partNumber: shown, description });
    }
  });

  test('[story-01-01#3] a numeric price too large to hold exactly is listed with its reason', async () => {
    const { summary } = await freshLoad([['BWE-HUGE', 'Huge price', 1e15], ['BWE-FINE', 'Fine', 1]]);
    expect(summary.notLoaded).toEqual([expect.objectContaining({ rowNumber: 2, reason: 'price is too large: "1000000000000000"' })]);
  });

  test('a file whose heading row lacks a mapped column is refused whole, and nothing is loaded', async () => {
    await portal.close();
    portal = await startPortal();
    const pat = await portal.signIn(PAT);
    const response = await pat.upload(LOAD, 'wrong.xlsx', await workbook([['BWE-A', 'A', 1]], ['Item', 'Description', 'Price']));
    expect(response.status).toBe(400);
    expect(response.json.message).toMatch(/no column headed "part number"/);
    expect(await productCount(portal)).toBe(0);
    const notExcel = await pat.upload(LOAD, 'notes.xlsx', Buffer.from('not a workbook'));
    expect(notExcel.status).toBe(400);
  });

  test('only a price maintainer can run the load; rep Sam is refused and nothing is loaded', async () => {
    await portal.close();
    portal = await startPortal();
    const sam = await portal.signIn(SAM);
    const response = await sam.upload(LOAD, 'sam.xlsx', await workbook([['BWE-A', 'A', 1]]));
    expect(response.status).toBe(403);
    expect(await productCount(portal)).toBe(0);
  });
});
