import { test } from "node:test";
import assert from "node:assert/strict";
import { toMinor, fromMinor, MoneyError } from "./toMinor.js";
import { paystackAmount } from "../providers/paystack.js";
import { stripeAmount } from "../providers/stripe.js";

test("NGN 19.99 becomes 1999 kobo, not 1998.9999999999998", () => {
  assert.equal(toMinor("19.99", 2), 1999);
});

test("NGN 4.35 becomes 435, no kobo goes missing", () => {
  assert.equal(toMinor("4.35", 2), 435);
});

test("JPY 500 stays 500", () => {
  assert.equal(toMinor("500", 0), 500);
});

test("KWD 1.25 becomes 1250", () => {
  assert.equal(toMinor("1.25", 3), 1250);
});

test("too many decimals is rejected, not silently rounded", () => {
  assert.throws(() => toMinor("10.999", 2), MoneyError);
  assert.throws(() => toMinor("500.5", 0), MoneyError);
});

test("garbage is rejected", () => {
  assert.throws(() => toMinor("-5", 2), MoneyError);
  assert.throws(() => toMinor("1e3", 2), MoneyError);
  assert.throws(() => toMinor("", 2), MoneyError);
});

test("fromMinor goes back the other way", () => {
  assert.equal(fromMinor(1999, 2), "19.99");
  assert.equal(fromMinor(5, 2), "0.05");
  assert.equal(fromMinor(1250, 3), "1.250");
  assert.equal(fromMinor(500, 0), "500");
});

test("provider rules", () => {
  assert.equal(paystackAmount("100", "NGN"), 10000);
  assert.equal(paystackAmount("5000", "XOF"), 500000);
  assert.throws(() => paystackAmount("50.5", "XOF"), MoneyError);
  assert.equal(stripeAmount("10.99", "USD"), 1099);
  assert.equal(stripeAmount("500", "JPY"), 500);
});
