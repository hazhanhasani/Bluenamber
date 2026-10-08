const BRAND = "BlueNumber";
const PROVIDER_IMPLEMENTED = false; // Switch only after implementing Numberland's verified API contract.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "x-frame-options": "DENY"
    }
  });
}

function isReady(env) {
  return PROVIDER_IMPLEMENTED &&
    !!env.DB && !!env.NUMBERLAND_API_KEY &&
    !!env.BAZAAR_ACCESS_TOKEN && !!env.BAZAAR_VALIDATE_URL &&
    env.ENABLE_PURCHASES === "true";
}

function products(env) {
  if (!isReady(env)) return [];
  try {
    const items = JSON.parse(env.PRODUCTS_JSON || "[]");
    if (!Array.isArray(items)) return [];
    return items.filter(item =>
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.sku === "string" &&
      /^[a-zA-Z0-9_.-]{1,80}$/.test(item.sku)
    ).map(item => ({ id: item.id, title: item.title, sku: item.sku, description: String(item.description || "") }));
  } catch {
    return [];
  }
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(v => v.toString(16).padStart(2, "0")).join("");
}

// This never trusts the client receipt alone. The remote purchase verifier must be
// configured and verified against the exact package, SKU, and token.
async function verifyWithBazaar(env, sku, token) {
  const url = String(env.BAZAAR_VALIDATE_URL)
    .replaceAll("{package}", encodeURIComponent("ir.bluenumber.app"))
    .replaceAll("{sku}", encodeURIComponent(sku))
    .replaceAll("{token}", encodeURIComponent(token));
  const target = new URL(url);
  if (target.protocol !== "https:" ||
      !["pardakht.cafebazaar.ir", "api.cafebazaar.ir"].includes(target.hostname))
    throw new Error("UNSAFE_VERIFIER");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const result = await fetch(target.toString(), {
      headers: { Authorization: "Bearer " + env.BAZAAR_ACCESS_TOKEN, Accept: "application/json" },
      signal: controller.signal
    });
    if (!result.ok) throw new Error("BAZAAR_VERIFY_ERROR");
    const body = await result.json();
    return body.purchaseState === 0 && (body.productId == null || body.productId === sku);
  } finally {
    clearTimeout(timeout);
  }
}

async function verifyPurchase(request, env) {
  if (!isReady(env)) return json({ error: "PURCHASES_NOT_READY" }, 503);
  const size = Number(request.headers.get("content-length") || 0);
  if (size > 8192) return json({ error: "PAYLOAD_TOO_LARGE" }, 413);
  let input;
  try { input = await request.json(); } catch { return json({ error: "INVALID_JSON" }, 400); }
  const sku = input && input.sku;
  const token = input && input.purchaseToken;
  if (typeof sku !== "string" || typeof token !== "string" || token.length < 8 || token.length > 2048)
    return json({ error: "INVALID_PURCHASE" }, 400);
  if (!products(env).some(p => p.sku === sku))
    return json({ error: "UNKNOWN_PRODUCT" }, 400);
  const tokenHash = await sha256(token);
  const existing = await env.DB.prepare("SELECT id, verification_state FROM purchase_receipts WHERE token_hash = ?").bind(tokenHash).first();
  if (existing) return json({ id: existing.id, state: existing.verification_state }, 200);
  let valid = false;
  try { valid = await verifyWithBazaar(env, sku, token); }
  catch { return json({ error: "VERIFICATION_UNAVAILABLE" }, 502); }
  if (!valid) return json({ error: "UNVERIFIED_PURCHASE" }, 403);
  // Do NOT consume the Bazaar purchase or deliver a number before verified
  // fulfillment, idempotent provider ordering, and user authentication exist.
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT OR IGNORE INTO purchase_receipts (id, token_hash, product_id, verification_state) VALUES (?, ?, ?, ?)"
  ).bind(id, tokenHash, sku, "verified_pending_fulfillment").run();
  const saved = await env.DB.prepare("SELECT id, verification_state FROM purchase_receipts WHERE token_hash = ?").bind(tokenHash).first();
  return json({ id: saved.id, state: saved.verification_state }, 202);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health")
      return json({ ok: true, service: "bluenamber-api", version: "1.0.0" });
    if (request.method === "GET" && url.pathname === "/v1/config")
      return json({ brand: BRAND, provider: "numberland", paymentsEnabled: isReady(env), providerConnected: false });
    if (request.method === "GET" && url.pathname === "/v1/catalog")
      return json({ items: products(env), available: isReady(env), notice: isReady(env) ? null : "Integration pending provider verification" });
    if (request.method === "POST" && url.pathname === "/v1/purchases/verify")
      return verifyPurchase(request, env);
    return json({ error: "NOT_FOUND" }, 404);
  }
};