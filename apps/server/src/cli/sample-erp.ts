import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { writeSampleErp } from '../seed/sample-erp.ts';

const file = resolve(process.argv[2] ?? resolve(import.meta.dirname, '../../../../seed/sample-erp.xlsx'));
mkdirSync(dirname(file), { recursive: true });
const facts = await writeSampleErp(file);
console.log(`Wrote ${file}: ${facts.productRows} product rows, ${facts.good.length} loadable, ${facts.bad.length} deliberately bad.`);
