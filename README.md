# BlueNumber / بلونامبر

Native Android storefront and Cloudflare Worker for virtual-number services.
**Provider: Callinoo (Ozvinoo API)** — https://api.ozvinoo.xyz/

Live read-only service/country inventory is connected. Billing and ordering remain disabled.

## Current deployment status
- **GitHub**: https://github.com/hazhanhasani/Bluenamber
- **Worker**: https://bluenamber.hazhanhasani4268-0f9.workers.dev
- **Database**: Cloudflare D1 `bluenamber-db`
- **Android**: Kotlin / Jetpack Compose; package `ir.bluenumber.app`
- **Payments**: Bazaar Poolakey scaffold, intentionally disabled until verified delivery, server receipt validation and refund handling exist.
- **Browse live country stock**: `/v1/services`, `/v1/quotes?serviceId=1`. Retail prices include a 20% markup calculated server-side in Toman; orders and payments remain disabled.
- **Numberland**: removed as the active integration. Historic order records retain their original provider identifier.

## Live product discovery
- Standard virtual-number application list: currently only Telegram VIP returned by the provider account.
- 154 Telegram-specific number country offers.
- 9 Telegram Stars packages and 3 Telegram Premium packages.
- `GET /v1/other-services?category=stars`, `premium`, or `telegram-numbers`.
- WhatsApp, Instagram and Google numbers are not advertised without live application inventory from a provider.
- All public prices are final marked-up prices in Toman, not supplier prices.
- Purchases remain disabled until authenticated order fulfillment and payment verification are complete.

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
Read-only API authentication is verified. Purchase fulfillment and customer-payment verification are not yet implemented.
See `docs/CALLINOO.md`.

## Local development
```bash
cd worker && npm install && npm test && npm run dev
cd ../android && gradle :app:assembleDebug
```
For release signing, retain the permanent original keystore as described in
`docs/SIGNING.md`. Never commit release signing keys or third-party API tokens.

**Android update signature warning:** runner-generated CI debug APKs have
rotating signing keys. They cannot replace another CI debug APK installed under
the same package. Use the permanent release key for every distributed update;
users of old debug builds must uninstall the incompatible debug package once.
The release version is now `1.0.3` (`versionCode=4`).
