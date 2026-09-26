import { describe, expect, test } from 'vitest';
import { formatPercent, formatPrice, parsePercentText, parsePriceText } from '../src/money.ts';

describe('prices in ten-thousandths', () => {
  test.each([
    ['12.50', 125_000],
    ['0.0040', 40],
    ['0.004', 40],
    ['180', 1_800_000],
    [' 7 ', 70_000],
    ['0.0001', 1],
  ])('reads %s', (text, expected) => {
    expect(parsePriceText(text)).toEqual({ ok: true, tenThousandths: expected });
  });

  test.each([
    ['', 'no price'],
    ['$12', 'price is not a plain number: "$12"'],
    ['1,234.50', 'price is not a plain number: "1,234.50"'],
    ['#REF!', 'price is not a plain number: "#REF!"'],
    ['0', 'price is not positive: "0"'],
    ['0.0000', 'price is not positive: "0.0000"'],
    ['-3', 'price is not positive: "-3"'],
    ['0.12345', 'price has more than 4 decimal places: "0.12345"'],
    ['1e3', 'price is not a plain number: "1e3"'],
    ['12.', 'price is not a plain number: "12."'],
  ])('refuses %j', (text, reason) => {
    expect(parsePriceText(text)).toEqual({ ok: false, reason });
  });

  test.each([
    [125_000, '12.50'],
    [40, '0.0040'],
    [4567, '0.4567'],
    [1_800_000, '180.00'],
    [1, '0.0001'],
  ])('shows %i as %s', (value, text) => {
    expect(formatPrice(value)).toBe(text);
  });
});

describe('percentages in hundredths', () => {
  test('reads and shows', () => {
    expect(parsePercentText('12.5')).toEqual({ ok: true, hundredths: 1250 });
    expect(parsePercentText('8 %')).toEqual({ ok: true, hundredths: 800 });
    expect(parsePercentText('100')).toEqual({ ok: true, hundredths: 10_000 });
    expect(parsePercentText('100.01').ok).toBe(false);
    expect(parsePercentText('-1').ok).toBe(false);
    expect(parsePercentText('12.345').ok).toBe(false);
    expect(formatPercent(1250)).toBe('12.5 %');
    expect(formatPercent(1000)).toBe('10 %');
    expect(formatPercent(1225)).toBe('12.25 %');
  });
});
