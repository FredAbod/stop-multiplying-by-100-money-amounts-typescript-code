import { CURRENCY_DECIMALS } from "../money/currencies.js";
import { MoneyError, toMinor } from "../money/toMinor.js";

// Only the currencies this app has checked against Stripe's docs.
const STRIPE_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
type StripeCurrency = (typeof STRIPE_CURRENCIES)[number];

function isStripeCurrency(code: string): code is StripeCurrency {
  return (STRIPE_CURRENCIES as readonly string[]).includes(code);
}

// Stripe wants the currency's minor unit:
// USD 10.99 -> 1099, JPY 500 -> 500 (zero-decimal).
export function stripeAmount(amount: string, currency: string): number {
  if (!isStripeCurrency(currency)) {
    throw new MoneyError(`Stripe does not support ${currency} in this app`);
  }
  return toMinor(amount, CURRENCY_DECIMALS[currency]);
}
