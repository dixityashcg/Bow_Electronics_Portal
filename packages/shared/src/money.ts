/**
 * Money and percentages are whole numbers in both databases (architecture §5.2):
 * prices in ten-thousandths of the currency unit, percentages in hundredths of
 * a percent. Nothing here ever holds money in a floating-point number.
 */

export const PRICE_SCALE = 10_000;

/** A plain positive decimal with at most four places, e.g. "12.50" or "0.0040". */
const PLAIN_PRICE = /^(\d{1,12})(?:\.(\d{1,4}))?$/;

export type PriceParse =
  | { ok: true; tenThousandths: number }
  | { ok: false; reason: string };

/** Reads a price typed by a person or held as text in a spreadsheet cell. */
export function parsePriceText(text: string): PriceParse {
  const trimmed = text.trim();
  if (trimmed === '') return { ok: false, reason: 'no price' };
  const match = PLAIN_PRICE.exec(trimmed);
  if (!match) {
    if (/^-/.test(trimmed)) return { ok: false, reason: `price is not positive: "${trimmed}"` };
    if (/^\d+\.\d{5,}$/.test(trimmed)) {
      return { ok: false, reason: `price has more than 4 decimal places: "${trimmed}"` };
    }
    return { ok: false, reason: `price is not a plain number: "${trimmed}"` };
  }
  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? '').padEnd(4, '0'));
  const tenThousandths = whole * PRICE_SCALE + fraction;
  if (tenThousandths <= 0) return { ok: false, reason: `price is not positive: "${trimmed}"` };
  if (!Number.isSafeInteger(tenThousandths)) {
    return { ok: false, reason: `price is too large: "${trimmed}"` };
  }
  return { ok: true, tenThousandths };
}

/** Shows a price with 2 decimals, or 4 when the price needs them (0.0040). */
export function formatPrice(tenThousandths: number): string {
  const whole = Math.floor(tenThousandths / PRICE_SCALE);
  const fraction = String(tenThousandths % PRICE_SCALE).padStart(4, '0');
  return tenThousandths % 100 === 0 ? `${whole}.${fraction.slice(0, 2)}` : `${whole}.${fraction}`;
}

const PLAIN_PERCENT = /^(\d{1,3})(?:\.(\d{1,2}))?$/;

export type PercentParse =
  | { ok: true; hundredths: number }
  | { ok: false; reason: string };

/** A percentage from 0 to 100 with at most two places; 12.5 % is 1,250. */
export function parsePercentText(text: string): PercentParse {
  const trimmed = text.trim().replace(/\s*%$/, '');
  const match = PLAIN_PERCENT.exec(trimmed);
  if (!match) return { ok: false, reason: `not a percentage: "${text.trim()}"` };
  const hundredths = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  if (hundredths > 10_000) return { ok: false, reason: 'a discount cannot be more than 100 %' };
  return { ok: true, hundredths };
}

export function formatPercent(hundredths: number): string {
  const whole = Math.floor(hundredths / 100);
  const fraction = hundredths % 100;
  if (fraction === 0) return `${whole} %`;
  return `${whole}.${String(fraction).padStart(2, '0').replace(/0$/, '')} %`;
}
