CREATE TABLE IF NOT EXISTS purchase_receipts (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  verification_state TEXT NOT NULL CHECK (verification_state IN ('verified_pending_fulfillment','fulfilled','failed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_purchase_state ON purchase_receipts(verification_state);
