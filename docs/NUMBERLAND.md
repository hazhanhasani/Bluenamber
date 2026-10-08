# Numberland integration contract and workflow

Provider reference: https://numberland.ir/developers

## Confirmed from provided description
- **standard** (شماره عادی), **permanent** (شماره دائمی), **rental** (شماره اجاره‌ای).
- Inventory and prices are grouped by service, country and carrier; supplier discounts may be reflected.
- Reseller markup is allowed. Calculate on server using integer minor units; use the actual supplier response currency.
- Reserve using service, country and carrier (including supplier-defined cheapest-carrier option). The supplier returns a numeric activation ID and telephone number, charges the reseller balance, and limits SMS reception to an expiry window.
- Poll activation state and retrieve the SMS code. Support repeat SMS while still active.
- Cancel only if no code received. Ending and retries are separate actions. Supplier-side balance may be refunded on valid cancellation or expiry without SMS.

## Missing contract — do not guess
- Exact base URL, path and HTTP method for each of: price/stock, order, status and change status
- API key transport (query/header/body), authentication format and IP allowlisting rules
- Response and error JSON / text examples, including per-product type differences
- Actual country/service/operator identifiers, automatic operator value, timeouts and rate limits
- Provider order idempotency support, refund timeline, stock stale/price change behavior
- Payment receipt verification contract, Bazaar SKU mapping, fulfillment retries and purchase consumption
- Customer authentication and authorization design for protecting phone numbers and OTP codes

## Architecture
`number-domain.js`: business rules (pricing, typed categories, state transitions).
`numberland-adapter.js`: explicit adapter contract. Intentionally throws rather than fabricating HTTP calls.
`index.js`: public discovery API and a fail-closed purchase interface.
`migrations/0002_number_orders.sql`: transactional order ledger schema (no secrets or SMS code plaintext).

## State flow

```
awaiting_payment -> paid -> reserving -> waiting_code
waiting_code -> code_received -> finished
waiting_code -> retry_requested -> waiting_code
waiting_code -> cancel_requested -> cancelled -> refund_pending -> refunded
waiting_code -> expired -> refund_pending -> refunded
paid / reserving -> refund_pending (after supplier failure and reconciliation)
```

An SMS received before cancellation must block cancellation. Supplier refunds and customer refunds are distinct transactions, each requiring explicit reconciliation. Every provider status update must be followed by a fresh status read, as described by Numberland.

## Application API available now

- `GET /v1/number-types`: three product types. Not an inventory quote.
- `GET /v1/provider/capabilities`: current adapter readiness and planned steps.
- `GET /v1/catalog`: only confirmed, approved catalogue items (currently empty).
- `POST /v1/orders`: 503 until completed and secured.

No live purchase, SMS retrieval, cancellation or refund endpoint is enabled until provider integration and per-user authentication are implemented. A supplier API key alone MUST NEVER flip the service to a live state.
