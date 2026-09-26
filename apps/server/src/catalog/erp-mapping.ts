/**
 * How the ERP spreadsheet's columns map to the store (story-01-01, field table).
 *
 * PROVISIONAL. The story's definition of done says the columns are mapped with
 * the ERP owner and the mapping is kept with the story. No ERP owner is named
 * yet (architecture C-10), so these are the column headings of the synthetic
 * sample (architecture §4.8). The ERP owner confirms or corrects them before
 * the run against the real file. Headings are matched ignoring case and
 * surrounding spaces; the first non-empty row of the first worksheet is the
 * heading row.
 */
export const erpColumnMapping = {
  partNumber: ['part number'],
  description: ['description'],
  price: ['price'],
} as const;

export type ErpField = keyof typeof erpColumnMapping;
