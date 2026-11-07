import { MoneyError, toMinor } from "../money/toMinor.js";

const PAYSTACK_CURRENCIES = ["NGN", "GHS", "KES", "ZAR", "USD", "XOF"] as const;
type PaystackCurrency = (typeof PAYSTACK_CURRENCIES)[number];

function isPaystackCurrency(code: string): code is PaystackCurrency {
  return (PAYSTACK_CURRENCIES as readonly string[]).includes(code);
}

// Paystack wants every amount in the subunit, i.e. x100.
// XOF has no subunit, but Paystack still wants x100,
// so we only allow whole XOF amounts.
export function paystackAmount(amount: string, currency: string): number {
  if (!isPaystackCurrency(currency)) {
    throw new MoneyError(`Paystack does not support ${currency} in this app`);
  }
  if (currency === "XOF" && amount.includes(".")) {
    throw new MoneyError("XOF amounts must be whole numbers");
  }
  return toMinor(amount, 2);
}
