# BlueNumber / بلونامبر

Native Android storefront and Cloudflare Worker for virtual-number services.
**Provider: Callinoo (Ozvinoo API)** — https://api.ozvinoo.xyz/

## Current deployment status
- **GitHub**: https://github.com/hazhanhasani/Bluenamber
- **Worker**: https://bluenamber.hazhanhasani4268-0f9.workers.dev
- **Database**: Cloudflare D1 `bluenamber-db`
- **Android**: Kotlin / Jetpack Compose; package `ir.bluenumber.app`
- **Payments**: Bazaar Poolakey scaffold, intentionally disabled until verified delivery, server receipt validation and refund handling exist.
- **Numberland**: removed as the active integration. Historic order records retain their original provider identifier.

## Web home page

- `GET /` and `/index.html` render the public RTL BlueNumber service status/landing page.
- This landing page is **not an admin login** and does not allow user or financial management.
- No provider credentials or SMS codes are exposed to the browser.

## API
`GET /health`, `GET /v1/config`, `GET /v1/provider/capabilities`,
`GET /v1/number-types`, `GET /v1/catalog`.
`POST /v1/orders` and `POST /v1/purchases/verify` currently reject financial transactions.

## Callinoo integration
`worker/src/callinoo-adapter.js` contains the internal **read-only** integration
contract (balance, service discovery and per-service prices). The token stays on
Cloudflare only. It is not exposed to the Android app or the public API.
The documented URL forms still require live authentication testing before enabling commerce.
See `docs/CALLINOO.md`.

## Local development
```bash
cd worker && npm install && npm test && npm run dev
cd ../android && gradle :app:assembleDebug
```
For release signing, retain the permanent original keystore as described in
`docs/SIGNING.md`. Never commit release signing keys or third-party API tokens.
