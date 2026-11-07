export class MoneyError extends Error {}

// "19.99" + 2 decimals -> 1999
// "500"   + 0 decimals -> 500
// "1.25"  + 3 decimals -> 1250
export function toMinor(amount: string, decimals: number): number {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(amount.trim());
  if (!match) {
    throw new MoneyError(`"${amount}" is not a valid amount`);
  }

  const whole = match[1]!;
  const fraction = match[2] ?? "";

  if (fraction.length > decimals) {
    throw new MoneyError(
      `"${amount}" has ${fraction.length} decimal places, this currency allows ${decimals}`
    );
  }

  const minor = Number(whole + fraction.padEnd(decimals, "0"));

  if (!Number.isSafeInteger(minor)) {
    throw new MoneyError(`"${amount}" is too large`);
  }
  return minor;
}

// 1999 + 2 decimals -> "19.99"
export function fromMinor(minor: number, decimals: number): string {
  if (decimals === 0) return String(minor);
  const digits = String(minor).padStart(decimals + 1, "0");
  return `${digits.slice(0, -decimals)}.${digits.slice(-decimals)}`;
}
