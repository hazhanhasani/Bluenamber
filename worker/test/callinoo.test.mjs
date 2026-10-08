import test from "node:test";
import assert from "node:assert/strict";
import api from "../src/index.js";
import { CallinooAdapter, CallinooError, isCallinooConfigured } from "../src/callinoo-adapter.js";
import { NUMBER_TYPES, calculateRetailPrice, moveOrder, validateSelection } from "../src/number-domain.js";

test("Callinoo is primary in public config and billing stays disabled", async () => {
  const env = {
    CALLINOO_API_TOKEN: "test-key-123456",
    ENABLE_PURCHASES: "true",
    BAZAAR_ACCESS_TOKEN: "fake",
    BAZAAR_VALIDATE_URL: "https://api.cafebazaar.ir/verify",
    DB: {}
  };
  const config = await (await api.fetch(new Request("https://example.com/v1/config"), env)).json();
  assert.equal(config.provider, "callinoo");
  assert.equal(config.paymentsEnabled, false);
  assert.equal(config.providerConnected, false);

  const capabilities = await (await api.fetch(new Request("https://example.com/v1/provider/capabilities"), env)).json();
  assert.equal(capabilities.provider, "callinoo");
  assert.equal(capabilities.configured, true);
  assert.equal(capabilities.connected, false);
  assert.ok(capabilities.steps.every(s => s.supported === false));

  const order = await api.fetch(new Request("https://example.com/v1/orders", {method:"POST",body:"{}"}), env);
  assert.equal(order.status, 503);
  const verify = await api.fetch(new Request("https://example.com/v1/purchases/verify", {method:"POST",body:"{}"}), env);
  assert.equal(verify.status, 503);
});

test("only verified product type shown, no fabricated rent or permanent", async () => {
  assert.deepEqual(NUMBER_TYPES.map(p=>p.id),["standard"]);
  const res = await (await api.fetch(new Request("https://example.com/v1/number-types"), {})).json();
  assert.deepEqual(res.items, NUMBER_TYPES);
  assert.equal(res.live, false);
});

test("Callinoo read methods access only the configured domain and endpoints", async () => {
  const called=[];
  const adapter = new CallinooAdapter({
    token:"my-private-token",
    fetcher:async (url, init) => {
      called.push({url,init});
      return {ok:true,text:async()=>JSON.stringify({success:true,items:[]})};
    }
  });
  await adapter.getBalance();
  await adapter.listApplications();
  await adapter.getPrices("tg");
  assert.deepEqual(called.map(x => new URL(x.url).hostname), Array(3).fill("api.ozvinoo.xyz"));
  assert.deepEqual(called.map(x => new URL(x.url).pathname),[
    "/web/my-private-token/get-balance",
    "/web/my-private-token/applications",
    "/web/my-private-token/get-prices/tg"
  ]);
  assert.ok(called.every(x => x.init.method === "GET"));
  assert.ok(called.every(x => x.init.redirect === "error"));
  assert.equal(isCallinooConfigured({CALLINOO_API_TOKEN:"validtoken"}),true);
  assert.equal(isCallinooConfigured({}),false);
});

test("invalid service input rejected before outbound calls", async () => {
  let requests=0;
  const adapter=new CallinooAdapter({token:"private-1234",fetcher:async()=>{requests++;throw new Error("network")}});
  assert.throws(() => adapter.getPrices("../secret"),/INVALID_SERVICE_ID/);
  assert.throws(() => adapter.getPrices("abc?bad"),/INVALID_SERVICE_ID/);
  assert.equal(requests,0);
  await assert.rejects(adapter.reserveNumber(),/PURCHASING_DISABLED/);
  await assert.rejects(adapter.getStatus(),/STATUS_API_UNVERIFIED/);
  await assert.rejects(adapter.setStatus(),/STATUS_API_UNVERIFIED/);
});

test("adapter fails closed on upstream errors and never returns raw tokens", async () => {
  const adapter=new CallinooAdapter({token:"private-1234",fetcher:async()=>{throw new Error("secret in failure")}});
  await assert.rejects(adapter.getBalance(),e=>e instanceof CallinooError && e.message==="UPSTREAM_UNAVAILABLE");
});

test("existing safe pricing and order rules remain intact", () => {
  assert.equal(calculateRetailPrice(10001,1250,500),11752);
  assert.equal(validateSelection({type:"standard",service:"tg",country:"ru"}),true);
  assert.equal(validateSelection({type:"rental",service:"tg",country:"ru"}),false);
  assert.throws(()=>moveOrder({status:"waiting_code",smsReceived:true},"cancel_requested"),/SMS_ALREADY_RECEIVED/);
});
