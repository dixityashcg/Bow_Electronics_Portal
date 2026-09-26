import { resolve } from 'node:path';
import { LocalClock } from '../adapters/clock.ts';
import { CatalogService } from '../catalog/catalog.service.ts';
import { readErpWorkbook } from '../catalog/erp-reader.ts';
import { openDatabase } from '../db/database.ts';
import { buildSampleErp } from '../seed/sample-erp.ts';
import { seed } from '../seed/seed.ts';

/**
 * Seeds the local database. `--after-epic 01` also leaves the state the
 * epic-01 demo ends in, for later Epics' reviews: the sample spreadsheet loaded
 * through the real load by rep Pat, and one product closed for quoting.
 */
async function main() {
  const args = process.argv.slice(2);
  const afterEpicIndex = args.indexOf('--after-epic');
  const afterEpic = afterEpicIndex >= 0 ? args[afterEpicIndex + 1] : undefined;
  if (afterEpic !== undefined && afterEpic !== '01') {
    console.error(`--after-epic ${afterEpic} is not built yet; only 01 exists. Nothing was seeded.`);
    process.exit(2);
  }
  const clock = new LocalClock();
  const { db } = openDatabase(resolve(process.env.DATABASE_FILE ?? '.local/portal.db'));
  await seed(db, clock);

  if (afterEpic !== undefined) {
    const pat = await db.selectFrom('internal_user').select('internal_user_id').where('entra_object_id', '=', 'local-staff-pat').executeTakeFirstOrThrow();
    const { workbook } = await buildSampleErp();
    const read = await readErpWorkbook(Buffer.from(await workbook.xlsx.writeBuffer()));
    const catalog = new CatalogService(db, clock);
    await catalog.load(pat.internal_user_id, 'sample-erp.xlsx', read);
    const closed = await catalog.findByPartNumber(read.loadable[0]!.partNumber);
    await catalog.close(closed!.id);
    console.log(`Seeded after epic-01: ${read.loadable.length} products loaded, ${closed!.partNumber} closed for quoting.`);
  } else {
    console.log('Seeded: staff, resellers and signed standard discounts. The store is empty.');
  }
  await db.destroy();
}

void main();
