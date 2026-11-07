# money-minor-units

Companion code for "Stop Multiplying by 100 — Handle Money Amounts Safely in TypeScript for Beginners".

```bash
npm install
npm run build
npm test
npm run bug     # see the floating point problem
npm start       # POST http://localhost:3000/checkout
```

No real Paystack/Stripe calls are made: the app computes the amount each provider expects and returns it.
