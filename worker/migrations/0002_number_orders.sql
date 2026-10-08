-- Numberland order ledger. This migration changes no legacy payments.
-- Sensitive SMS contents and API credentials must never be stored in plaintext.
CREATE TABLE IF NOT EXISTS number_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK(type IN ('standard','permanent','rental')),
  service_code TEXT NOT NULL,
  country_code TEXT NOT NULL,
  operator_code TEXT,
  status TEXT NOT NULL CHECK(status IN (
    'awaiting_payment','paid','reserving','waiting_code','retry_requested',
    'code_received','cancel_requested','cancelled','expired',
    'refund_pending','refund_failed','refunded','finished')),
  supplier_order_id TEXT UNIQUE,
  phone_number TEXT,
  currency TEXT NOT NULL,
  supplier_price_minor INTEGER,
  sale_price_minor INTEGER,
  sms_received INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_number_orders_user_created
  ON number_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_number_orders_status ON number_orders(status);

CREATE TABLE IF NOT EXISTS number_order_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES number_orders(id),
  event_key TEXT NOT NULL UNIQUE,
  previous_status TEXT,
  next_status TEXT NOT NULL,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_number_events_order ON number_order_events(order_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS pricing_rules (
  id TEXT PRIMARY KEY,
  number_type TEXT NOT NULL CHECK(number_type IN ('standard','permanent','rental')),
  service_code TEXT NOT NULL,
  country_code TEXT NOT NULL,
  currency TEXT NOT NULL,
  markup_basis_points INTEGER NOT NULL DEFAULT 0
    CHECK(markup_basis_points >= 0 AND markup_basis_points <= 100000),
  fixed_fee_minor INTEGER NOT NULL DEFAULT 0 CHECK(fixed_fee_minor >= 0),
  UNIQUE(number_type, service_code, country_code, currency)
);