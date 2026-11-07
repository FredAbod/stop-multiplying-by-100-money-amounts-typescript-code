// How many digits come after the decimal point for each currency.
// NGN 2 (kobo), JPY 0 (no subunit), KWD 3.
export const CURRENCY_DECIMALS = {
  NGN: 2,
  GHS: 2,
  KES: 2,
  ZAR: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
  JPY: 0,
  KWD: 3,
  XOF: 0,
} as const;

export type Currency = keyof typeof CURRENCY_DECIMALS;

export function isCurrency(code: string): code is Currency {
  return Object.hasOwn(CURRENCY_DECIMALS, code);
}
