import ExcelJS from 'exceljs';

/**
 * The synthetic sample ERP spreadsheet (architecture §4.8): about 2,000
 * fictional electronic parts, every part number prefixed BWE- to mark it
 * invented, plus the deliberately bad rows story-01-01 c3–c5 and T-14 are
 * demonstrated with. Deterministic, so the same file is generated every time.
 *
 * The generator also returns what it wrote. Tests compare the loader against
 * these facts, which are computed here, independently of the loader.
 */

export interface SampleRow {
  rowNumber: number;
  partNumber: string;
  description: string;
  /** In ten-thousandths. */
  price: number;
}

export interface SampleBadRow {
  rowNumber: number;
  kind: 'no part number' | 'no price' | 'dollar sign' | 'thousands separator' | 'error value' | 'formula' | 'duplicate part number';
}

export interface SampleErpFacts {
  /** Product rows in the ERP: N in story-01-01 c1. */
  productRows: number;
  good: SampleRow[];
  bad: SampleBadRow[];
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Maker = (random: () => number, n: number) => { partNumber: string; description: string; price: number };

const pick = <T,>(random: () => number, items: readonly T[]): T => items[Math.floor(random() * items.length)]!;

/** Prices in ten-thousandths between two bounds, rounded to a plausible step. */
function priceBetween(random: () => number, low: number, high: number, step: number): number {
  const raw = low + random() * (high - low);
  return Math.max(step, Math.round(raw / step) * step);
}

const makers: Maker[] = [
  (random, n) => {
    const size = pick(random, ['0201', '0402', '0603', '0805', '1206']);
    const [cap, code] = pick(random, [['0.1 µF', '104'], ['1 µF', '105'], ['10 nF', '103'], ['4.7 µF', '475'], ['22 pF', '220']] as const);
    const volts = pick(random, ['6.3 V', '16 V', '25 V', '50 V']);
    const dielectric = pick(random, ['X7R', 'X5R', 'C0G']);
    return {
      partNumber: `BWE-C${size}${dielectric}${code}K-${n}`,
      description: `Capacitor, ceramic, ${cap}, ${volts}, ${dielectric}, ${size}`,
      price: priceBetween(random, 40, 900, 5),
    };
  },
  (random, n) => {
    const size = pick(random, ['0402', '0603', '0805']);
    const ohms = pick(random, ['10 Ω', '100 Ω', '1 kΩ', '4.7 kΩ', '10 kΩ', '100 kΩ']);
    const tol = pick(random, ['1 %', '5 %']);
    return {
      partNumber: `BWE-R${size}-${n}`,
      description: `Resistor, thick film, ${ohms}, ${tol}, ${size}`,
      price: priceBetween(random, 40, 300, 5),
    };
  },
  (random, n) => ({
    partNumber: `BWE-L${pick(random, ['1008', '1210', '2520'])}-${n}`,
    description: `Inductor, ${pick(random, ['1 µH', '4.7 µH', '10 µH', '47 µH'])}, ${pick(random, ['0.5 A', '1.2 A', '2 A'])}, shielded`,
    price: priceBetween(random, 500, 9000, 50),
  }),
  (random, n) => ({
    partNumber: `BWE-D${pick(random, ['SOD123', 'SMA', 'SOD323'])}-${n}`,
    description: `Diode, ${pick(random, ['Schottky', 'rectifier', 'Zener 5.1 V', 'TVS 15 V'])}, ${pick(random, ['SOD-123', 'SMA', 'SOD-323'])}`,
    price: priceBetween(random, 150, 6000, 50),
  }),
  (random, n) => ({
    partNumber: `BWE-Q${pick(random, ['N', 'P'])}${pick(random, ['30', '60', '100'])}-${n}`,
    description: `MOSFET, ${pick(random, ['N-channel', 'P-channel'])}, ${pick(random, ['30 V', '60 V', '100 V'])}, ${pick(random, ['SOT-23', 'DPAK', 'SO-8'])}`,
    price: priceBetween(random, 1000, 25000, 100),
  }),
  (random, n) => ({
    partNumber: `BWE-U${pick(random, ['LDO', 'BUCK'])}-${n}`,
    description: `Voltage regulator, ${pick(random, ['LDO 3.3 V 500 mA', 'LDO 5 V 1 A', 'buck 3.3 V 2 A', 'buck 5 V 3 A'])}`,
    price: priceBetween(random, 2000, 40000, 100),
  }),
  (random, n) => ({
    partNumber: `BWE-MCU${pick(random, ['32', '64', '128', '256'])}K-${n}`,
    description: `Microcontroller, 32-bit, ${pick(random, ['48 MHz', '72 MHz', '120 MHz', '240 MHz'])}, ${pick(random, ['32 KB', '64 KB', '128 KB', '256 KB'])} flash, ${pick(random, ['QFN-32', 'LQFP-48', 'LQFP-64'])}`,
    price: priceBetween(random, 8000, 1_800_000, 100),
  }),
  (random, n) => ({
    partNumber: `BWE-J${pick(random, ['USB', 'HDR', 'RJ45'])}-${n}`,
    description: `Connector, ${pick(random, ['USB-C receptacle', 'pin header 2×10', 'RJ45 with magnetics', 'terminal block 3-way'])}`,
    price: priceBetween(random, 1500, 45000, 100),
  }),
  (random, n) => ({
    partNumber: `BWE-Y${pick(random, ['8', '12', '16', '25'])}M-${n}`,
    description: `Crystal, ${pick(random, ['8 MHz', '12 MHz', '16 MHz', '25 MHz'])}, ${pick(random, ['10 ppm', '20 ppm'])}, 3.2 × 2.5 mm`,
    price: priceBetween(random, 1000, 9000, 50),
  }),
];

export async function buildSampleErp(options: { rows?: number; seed?: number } = {}): Promise<{ workbook: ExcelJS.Workbook; facts: SampleErpFacts }> {
  const goodRows = options.rows ?? 2000;
  const random = mulberry32(options.seed ?? 20260926);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Price list');
  sheet.columns = [
    { header: 'Part number', key: 'part', width: 30 },
    { header: 'Description', key: 'description', width: 60 },
    { header: 'Price', key: 'price', width: 12 },
  ];

  const facts: SampleErpFacts = { productRows: 0, good: [], bad: [] };
  // Where the bad rows go, spread through the file rather than bunched at the end.
  const badAt = new Map<number, SampleBadRow['kind']>([
    [37, 'no part number'],
    [211, 'no price'],
    [498, 'dollar sign'],
    [777, 'thousands separator'],
    [1024, 'error value'],
    [1333, 'formula'],
    [1600, 'duplicate part number'],
    [1601, 'duplicate part number'],
  ]);

  let rowNumber = 1;
  let made = 0;
  const addGood = (text = false) => {
    made += 1;
    const item = pick(random, makers)(random, made);
    rowNumber += 1;
    // A few prices held as text, the way a spreadsheet cell formatted as text holds them (FDE decision, 2026-09-26: plain decimal text loads).
    const cellPrice = text ? (item.price / 10_000).toFixed(4) : item.price / 10_000;
    sheet.addRow([item.partNumber, item.description, cellPrice]);
    facts.good.push({ rowNumber, ...item });
  };

  while (facts.good.length < goodRows || [...badAt.keys()].some((at) => at > rowNumber)) {
    const kind = badAt.get(rowNumber + 1);
    if (kind === undefined) {
      if (facts.good.length >= goodRows) break;
      addGood(facts.good.length % 400 === 7);
      continue;
    }
    rowNumber += 1;
    const n = made + 100_000 + rowNumber;
    switch (kind) {
      case 'no part number':
        sheet.addRow(['', 'Resistor, thick film, 22 Ω, 5 %, 0603', 0.004]);
        break;
      case 'no price':
        sheet.addRow([`BWE-R0603-${n}`, 'Resistor, thick film, 47 Ω, 5 %, 0603', null]);
        break;
      case 'dollar sign':
        sheet.addRow([`BWE-L1210-${n}`, 'Inductor, 22 µH, 0.8 A, shielded', '$12']);
        break;
      case 'thousands separator':
        sheet.addRow([`BWE-MCU512K-${n}`, 'Microcontroller, 32-bit, 240 MHz, 512 KB flash, LQFP-100', '1,234.50']);
        break;
      case 'error value':
        sheet.addRow([`BWE-DSMA-${n}`, 'Diode, Schottky, SMA', { error: '#REF!' }]);
        break;
      case 'formula':
        sheet.addRow([`BWE-Y16M-${n}`, 'Crystal, 16 MHz, 10 ppm, 3.2 × 2.5 mm', { formula: 'C3*2', result: 0.7 }]);
        break;
      case 'duplicate part number': {
        const first = facts.bad.every((b) => b.kind !== 'duplicate part number');
        sheet.addRow(['BWE-C0402X7R104K', 'Capacitor, ceramic, 0.1 µF, 16 V, X7R, 0402', first ? 0.0045 : 0.005]);
        break;
      }
    }
    facts.bad.push({ rowNumber, kind });
  }
  facts.productRows = rowNumber - 1;
  return { workbook, facts };
}

export async function writeSampleErp(file: string, options?: { rows?: number; seed?: number }): Promise<SampleErpFacts> {
  const { workbook, facts } = await buildSampleErp(options);
  await workbook.xlsx.writeFile(file);
  return facts;
}
