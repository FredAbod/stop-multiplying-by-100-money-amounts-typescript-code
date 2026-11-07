import { Router } from "express";
import { CURRENCY_DECIMALS, isCurrency } from "../money/currencies.js";
import { MoneyError, fromMinor, toMinor } from "../money/toMinor.js";
import { paystackAmount } from "../providers/paystack.js";
import { stripeAmount } from "../providers/stripe.js";

export const checkoutRouter = Router();

checkoutRouter.post("/checkout", (req, res) => {
  const { amount, currency, provider } = req.body ?? {};

  if (typeof amount !== "string") {
    res.status(400).json({ error: 'amount must be a string like "19.99"' });
    return;
  }
  if (typeof currency !== "string" || !isCurrency(currency)) {
    res.status(400).json({ error: "unknown currency" });
    return;
  }

  try {
    // 1. What WE store: integer minor units + currency code.
    const decimals = CURRENCY_DECIMALS[currency];
    const amountMinor = toMinor(amount, decimals);

    // 2. What the PROVIDER wants: their own rules.
    let providerAmount: number;
    if (provider === "paystack") {
      providerAmount = paystackAmount(amount, currency);
    } else if (provider === "stripe") {
      providerAmount = stripeAmount(amount, currency);
    } else {
      res.status(400).json({ error: "provider must be paystack or stripe" });
      return;
    }

    // In real life you would call the provider here with providerAmount.
    // This tutorial stops before the network call (no real API keys).
    res.json({
      stored: { amountMinor, currency },
      provider,
      providerAmount,
      display: `${currency} ${fromMinor(amountMinor, decimals)}`,
    });
  } catch (err) {
    if (err instanceof MoneyError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});
