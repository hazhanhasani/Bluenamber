# Callinoo / Ozvinoo integration

**Provider endpoint:** https://api.ozvinoo.xyz/

This replaces Numberland as the only active prospective upstream for BlueNumber.
The homepage is titled **Callinoo API**, but its detailed technical reference was not
retrievable through public access during this update. Never conflate unrelated SMM APIs with
virtual-number APIs just because they share an Ozvinoo domain.

## Known endpoint shapes (require authenticated verification)

The internal read-only adapter supports:

- `GET /web/{token}/get-balance`
- `GET /web/{token}/applications`
- `GET /web/{token}/get-prices/{service_id}`

A previously supplied purchase URL shape is
`/web/{token}/getNumber/{service_id}/{country}`.
**It is intentionally not invoked**: GET is a potentially charged action,
and exact response formats, refund behavior and order idempotency have not been verified.

Other provider methods for checking OTP status, cancellation, renting, or
long-lived numbers are not yet established. The public Android catalog does not
show unsupported products.

## Security

1. Save `CALLINOO_API_TOKEN` as a **Cloudflare Worker Secret** (not GitHub / Android source):
   `cd worker && npx wrangler secret put CALLINOO_API_TOKEN`
2. Token is embedded in upstream path only when calling the **fixed trusted host**
   `api.ozvinoo.xyz`. Avoid logging complete upstream URLs.
3. Server-side `fetch` disables redirects, uses timeout and refuses arbitrary paths.
4. Expose provider status, phone numbers and SMS ONLY to the authenticated owner of the order.
5. Avoid recording SMS codes in plaintext logs. Use per-user authorization and bounded polling.
6. Purchasing stays fail-closed even if someone adds secrets or sets
   `ENABLE_PURCHASES=true`; provider code must be explicitly completed and tested.

## What is required before go-live

- Verify API key and live balance with an authenticated *read-only* call
- Map real application, country, operator and price schemas, currency and markup
- Confirm actual charging and refund rules, SMS status endpoints, time limits and error handling
- Implement authenticated customer accounts, receipt verification and idempotent order fulfillment
- Create Bazaar products and reconcile payment, delivery, cancellation, expiration and refunds

## Client routes

`GET /v1/config` returns `provider: "callinoo"`.
`GET /v1/number-types` currently offers only a standard temporary-number category.
`GET /v1/catalog` stays empty until stock and prices are confirmed.
Financial routes remain disabled in production.

## Cloudflare Workers compatibility

Use `fetch(..., { redirect: 'manual' })` and explicitly block all HTTP 3xx responses.
The Workers runtime does not accept `redirect: 'error'`; using it caused every
API request to fail before contacting Callinoo. This has been corrected.

## Verified live connection (2026-10-08)
- The token saved as the `CALLINOO_API_TOKEN` Cloudflare Secret successfully authenticated against `GET /web/{token}/get-balance`. HTTP 200 and `balance` were observed; the actual balance was not logged or exposed.
- `GET /web/{token}/applications` returned one available application, service ID `1` and code `tg`.
- `GET /web/{token}/get-prices/1` returned 154 countries, with `country`, `range`, `count`, and supplier `price`.
- Currency shown in the account UI is **toman**; do not mix toman with rial.
- Official JSON OpenAPI schema: `https://api.ozvinoo.xyz/api/` (15 documented routes as checked).
- Country availability is public but supplier cost is not. `GET /v1/quotes?serviceId=1` returns `retailPriceToman=null` until owner selects a margin.
- Set `RETAIL_MARKUP_BPS` as a Worker environment variable (e.g. `1500` means **15 percent**); optionally `RETAIL_FIXED_FEE_TOMAN` for a fixed fee. This only enables displayed retail quotes, NEVER charging/fulfillment.
- `GET /v1/services` exposes normalized read-only service names and IDs.
- Purchase and SMS delivery endpoints remain disabled until verified Bazaar receipts, account authorization, order idempotency, supplier-balance sufficiency, and refund reconciliation are implemented.

The upstream API has a charged operation at
`/web/{token}/getNumber/{service_id}/{country}`. **Do not invoke that endpoint
for inventory discovery or connection testing.** The credential must stay in
Cloudflare Secrets, not in this repository, client apps, or public HTML.
