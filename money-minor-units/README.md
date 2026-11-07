# money-minor-units

Companion code for **"Stop Multiplying by 100 — Handle Money Amounts Safely in TypeScript for Beginners"**.

Shows why `amount * 100` is unsafe for money, and how to convert major units to integer minor units (kobo, cents, yen, fils) with a string-based helper that matches each currency’s decimal rules — then adapts those amounts for Paystack and Stripe.

No real payment API calls are made. The demo server only returns the integer each provider would expect.

## The problem

Floating-point multiplication quietly corrupts money amounts:

```text
19.99 * 100            → 1998.9999999999998
1150.15 * 100          → 115015.00000000001
Math.floor(4.35 * 100) → 434   // one kobo gone
500 * 100              → 50000 // fine for NGN, wrong for JPY on Stripe
```

Run the demo after building:

```bash
npm run bug
```

## The approach

1. Keep amounts as **strings** at the boundary (`"19.99"`), not floats.
2. Convert with `toMinor(amount, decimals)` — pad/truncate by currency decimals, reject invalid input.
3. Store **integer minor units + currency code**.
4. Convert again for each provider’s rules before charging.

| Currency | Decimals | Example |
|----------|----------|---------|
| NGN, USD, EUR, GBP, GHS, KES, ZAR | 2 | `"19.99"` → `1999` |
| JPY, XOF | 0 | `"500"` → `500` |
| KWD | 3 | `"1.25"` → `1250` |

**Provider quirks covered here**

- **Stripe** — uses the currency’s real minor unit (JPY stays whole yen).
- **Paystack** — always wants ×100, including XOF (whole amounts only).

## Project layout

```text
src/
  float-bug.ts           # reproduce the * 100 bug
  money/
    currencies.ts        # decimal map + Currency type
    toMinor.ts           # toMinor / fromMinor
    toMinor.test.ts
  providers/
    paystack.ts
    stripe.ts
  routes/checkout.ts     # POST /checkout
  app.ts
  server.ts
```

## Requirements

- Node.js 18+ (uses native `node:test` and ES modules)

## Setup

```bash
cd money-minor-units
npm install
npm run build
```

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm test` | Run unit tests |
| `npm run bug` | Print the floating-point examples |
| `npm start` | Start Express on port `3000` (or `PORT`) |

## API

`POST /checkout`

**Body**

```json
{
  "amount": "19.99",
  "currency": "NGN",
  "provider": "paystack"
}
```

- `amount` — string major units (e.g. `"19.99"`, `"500"`)
- `currency` — one of `NGN`, `GHS`, `KES`, `ZAR`, `USD`, `EUR`, `GBP`, `JPY`, `KWD`, `XOF`
- `provider` — `paystack` or `stripe`

**Success**

```json
{
  "stored": { "amountMinor": 1999, "currency": "NGN" },
  "provider": "paystack",
  "providerAmount": 1999,
  "display": "NGN 19.99"
}
```

**Examples**

```bash
# Paystack / NGN
curl -s -X POST http://localhost:3000/checkout \
  -H "Content-Type: application/json" \
  -d '{"amount":"19.99","currency":"NGN","provider":"paystack"}'

# Stripe / USD
curl -s -X POST http://localhost:3000/checkout \
  -H "Content-Type: application/json" \
  -d '{"amount":"10.99","currency":"USD","provider":"stripe"}'

# Stripe / JPY (zero-decimal)
curl -s -X POST http://localhost:3000/checkout \
  -H "Content-Type: application/json" \
  -d '{"amount":"500","currency":"JPY","provider":"stripe"}'

# Paystack / XOF (still ×100; no fractional part)
curl -s -X POST http://localhost:3000/checkout \
  -H "Content-Type: application/json" \
  -d '{"amount":"5000","currency":"XOF","provider":"paystack"}'
```

Invalid amounts, unknown currencies, unsupported provider currencies, or too many decimal places return `400` with an error message.

## Core helpers

```ts
toMinor("19.99", 2); // 1999
toMinor("500", 0);   // 500
toMinor("1.25", 3);  // 1250

fromMinor(1999, 2);  // "19.99"
fromMinor(500, 0);   // "500"
```

Too many decimals or non-amount strings throw `MoneyError` instead of rounding silently.

## License

ISC
