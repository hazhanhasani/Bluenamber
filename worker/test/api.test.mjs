import test from "node:test";
import assert from "node:assert/strict";
import api from "../src/index.js";

test("health remains reachable without secrets", async () => {
  const response = await api.fetch(new Request("https://example.com/health"), {});
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
});

test("payments fail closed without verified adapter", async () => {
  const response = await api.fetch(new Request("https://example.com/v1/config"), {});
  assert.equal((await response.json()).paymentsEnabled, false);
});

test("catalog is empty when provider not connected", async () => {
  const response = await api.fetch(new Request("https://example.com/v1/catalog"), {});
  const body = await response.json();
  assert.deepEqual(body.items, []);
  assert.equal(body.available, false);
});

test("billing endpoint refuses financial activity", async () => {
  const response = await api.fetch(new Request("https://example.com/v1/purchases/verify", { method: "POST", body: "{}" }), {});
  assert.equal(response.status, 503);
});
