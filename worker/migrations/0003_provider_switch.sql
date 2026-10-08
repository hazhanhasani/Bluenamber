-- Preserve historic Numberland provenance for old records.
-- New orders must explicitly populate provider_id = 'callinoo' once commerce is enabled.
ALTER TABLE number_orders ADD COLUMN provider_id TEXT NOT NULL DEFAULT 'numberland';
CREATE INDEX IF NOT EXISTS idx_number_orders_provider ON number_orders(provider_id, created_at DESC);
