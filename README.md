# BlueNumber | بلونامبر

Android storefront and Cloudflare Worker foundation for virtual-number services.

**Status:** Backend deployed as a safe, non-transactional bootstrap. Numberland API contract is currently unverified, and payments are intentionally disabled.

## Components

- `android/` — Native Kotlin/Jetpack Compose Android app, package `ir.bluenumber.app`.
- `worker/` — Cloudflare Worker with D1 receipt ledger and safe API routes.
- `.github/workflows/` — Android CI and manual signed release.
- `docs/` — integration and signing procedures.

## API

- `GET /health` — service readiness
- `GET /v1/config` — client feature flags
- `GET /v1/catalog` — product catalog (empty until Numberland adapter and pricing verified)
- `POST /v1/purchases/verify` — gated Bazaar verification, receipt deduplication and pending fulfillment (never activates without the audited provider adapter)

**Never enable production billing until automated provider ordering, fulfillment reconciliation, and account binding have been verified.**

## Quick start

1. Install JDK 17, Android SDK 35, and Gradle 8.11.1.
2. `cd android && gradle :app:assembleDebug`.
3. Worker: `cd worker && npm install && npx wrangler deploy` after logging into Cloudflare.
4. Follow `docs/SETUP.md` and `docs/SIGNING.md`.

The Numberland API endpoint was not publicly accessible during initial implementation. Do not invent endpoint paths or credentials.

## Versioning

Initial Android `versionCode=1`, `versionName=1.0.0`. Future updates must retain the *same* applicationId and original release signing key.
