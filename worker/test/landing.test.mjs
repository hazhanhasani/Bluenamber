import test from "node:test";
import assert from "node:assert/strict";
import api from "../src/index.js";

test("root and index.html show mobile friendly Persian landing page, not 404 JSON", async () => {
  for (const path of ["/","/index.html"]) {
    const response=await api.fetch(new Request("https://example.com"+path), {});
    assert.equal(response.status,200);
    assert.match(response.headers.get("content-type"),/text\/html/);
    assert.match(response.headers.get("content-security-policy"),/default-src 'none'/);
    const body=await response.text();
    assert.match(body,/بلونامبر/);
    assert.match(body,/name="viewport"/);
    assert.match(body,/id="refresh"/);
    assert.match(body,/این صفحه پنل مدیریت کاربران نیست/);
    assert.doesNotMatch(body,/NOT_FOUND/);
  }
});

test("favicon is correctly typed svg", async () => {
  const r=await api.fetch(new Request("https://example.com/favicon.svg"), {});
  assert.equal(r.status,200);
  assert.match(r.headers.get("content-type"),/image\/svg\+xml/);
});

test("configuration exposes only a boolean about provider token, never its value", async () => {
  const token="THIS_IS_A_SUPER_SECRET_VALUE";
  const env={CALLINOO_API_TOKEN:token, ENABLE_PURCHASES:"true", DB:{},BAZAAR_ACCESS_TOKEN:"test",BAZAAR_VALIDATE_URL:"https://api.cafebazaar.ir/test"};
  const r=await api.fetch(new Request("https://example.com/v1/config"),env);
  const content=await r.text();
  assert.ok(!content.includes(token));
  const c=JSON.parse(content);
  assert.equal(c.providerConfigured,true);
  assert.equal(c.providerConnected,false);
  assert.equal(c.paymentsEnabled,false);
});

test("catalog explains pending API validation without selling anything", async () => {
  const env={CALLINOO_API_TOKEN:"supersecret"};
  const r=await api.fetch(new Request("https://example.com/v1/catalog"),env);
  const json=await r.json();
  assert.equal(json.providerConfigured,true);
  assert.equal(json.available,false);
  assert.deepEqual(json.items,[]);
  assert.match(json.notice,/verification pending/);
  const inactive=await (await api.fetch(new Request("https://example.com/v1/catalog"),{})).json();
  assert.equal(inactive.providerConfigured,false);
});
