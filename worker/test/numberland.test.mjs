import test from "node:test";
import assert from "node:assert/strict";
import { NUMBER_TYPES, PROVIDER_STEPS, TRANSITIONS, moveOrder, calculateRetailPrice, validateSelection } from "../src/number-domain.js";
import { NumberlandAdapter, ProviderNotConfiguredError } from "../src/numberland-adapter.js";
import api from "../src/index.js";

test("exposes three Numberland product categories", async () => {
  const response = await api.fetch(new Request("https://example.com/v1/number-types"), {});
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.items.map(x => x.id), ["standard","permanent","rental"]);
  assert.equal(body.live, false);
});

test("supplier readiness is not overstated, even if environment contains keys", async () => {
  const env = { ENABLE_PURCHASES: "true", NUMBERLAND_API_KEY: "fake", BAZAAR_ACCESS_TOKEN: "fake", BAZAAR_VALIDATE_URL: "https://api.cafebazaar.ir/test", DB: {} };
  const response = await api.fetch(new Request("https://example.com/v1/provider/capabilities"), env);
  const body = await response.json();
  assert.equal(body.connected, false);
  assert.equal(body.paymentsEnabled, false);
  assert.ok(body.steps.every(x => x.supported === false));
  const buy = await api.fetch(new Request("https://example.com/v1/orders", { method: "POST", body: "{}" }), env);
  assert.equal(buy.status, 503);
});

test("price calculation is integer-safe, adds percentage and fixed fee", () => {
  assert.equal(calculateRetailPrice(10001, 1250, 500), 11752);
  assert.equal(calculateRetailPrice(0, 0), 0);
  assert.throws(() => calculateRetailPrice(100, -1), RangeError);
  assert.throws(() => calculateRetailPrice(Number.MAX_SAFE_INTEGER, 10000), RangeError);
  assert.throws(() => calculateRetailPrice(100, 100001), RangeError);
});

test("type service country and operator are strictly validated", () => {
  assert.equal(validateSelection({ type:"standard", service:"tg", country:"ru", operator:"auto" }), true);
  assert.equal(validateSelection({ type:"rental", service:"wa", country:"7" }), true);
  assert.equal(validateSelection({ type:"permanent", service:"tg", country:"us" }), true);
  assert.equal(validateSelection({ type:"fake", service:"tg", country:"us" }), false);
  assert.equal(validateSelection({ type:"standard", service:"../bad", country:"us" }), false);
});

test("SMS arrival prevents cancellation and no transition can skip validation", () => {
  const waiting = { status:"waiting_code", smsReceived:false };
  assert.equal(moveOrder(waiting, "cancel_requested").status, "cancel_requested");
  assert.throws(() => moveOrder({ ...waiting, smsReceived:true }, "cancel_requested"), /SMS_ALREADY_RECEIVED/);
  assert.throws(() => moveOrder(waiting, "refunded"), /INVALID_ORDER_TRANSITION/);
  assert.equal(moveOrder({ status:"expired", smsReceived:false }, "refund_pending").status, "refund_pending");
  assert.equal(moveOrder({ status:"refund_pending", smsReceived:false }, "refunded").status, "refunded");
  assert.deepEqual(TRANSITIONS.finished, []);
});

test("supplier adapter fails closed instead of calling speculative endpoints", async () => {
  const adapter = new NumberlandAdapter();
  for (const promise of [
    adapter.getInventory({}), adapter.reserveNumber({}), adapter.getStatus({}), adapter.setStatus({})
  ]) await assert.rejects(promise, ProviderNotConfiguredError);
  assert.equal(PROVIDER_STEPS.length, 5);
  assert.equal(NUMBER_TYPES.length, 3);
});
