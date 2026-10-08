# Deployment setup

## Cloudflare
- Account: configure your own Cloudflare credentials locally.
- Worker name: `bluenamber`.
- D1 binding: `DB`, database `bluenamber-db`.
- Run migrations: `npx wrangler d1 migrations apply bluenamber-db --remote` from `worker`.
- Add sensitive credentials ONLY with `wrangler secret put CALLINOO_API_TOKEN` and `wrangler secret put BAZAAR_ACCESS_TOKEN`.
- Callinoo API operations and response shapes are **not verified**. Implement and test the real provider adapter before marking `PROVIDER_IMPLEMENTED` true in source.
- A Bazaar verification endpoint is configurable using `BAZAAR_VALIDATE_URL`; it must be confirmed against official current API documentation.
- `ENABLE_PURCHASES` remains false. A live catalog, fixed-price Bazaar SKUs, verified receipt flow, provider purchase, order lifecycle, SMS polling, cancellation, and consumer account authentication are REQUIRED before enabling purchasing.

## Cafe Bazaar
1. Register Android package `ir.bluenumber.app` in the Cafe Bazaar developer console.
2. Obtain the application's **public** RSA key (not the Android signing key).
3. Define all in-app SKU IDs in the Bazaar console with their authorized prices.
4. Set `BAZAAR_RSA_PUBLIC_KEY` as a GitHub Actions repository variable.
5. Configure server-side developer API credentials as Cloudflare secrets.
6. Verify with real sandbox/production Bazaar purchases and refunds before launch.
7. Do not ship a billing-enabled release while the Callinoo provider is not operational.

## App
The app uses the live Worker at `https://bluenamber.hazhanhasani4268-0f9.workers.dev`. It never bundles Callinoo API credentials.

## Missing integration contract
Source document: https://api.ozvinoo.xyz/ (unreachable when this scaffold was created).
Do NOT copy API paths from unrelated virtual-number providers. Obtain the real authenticated docs, methods, sample payloads, order idempotency rules and error codes.
