ALTER TABLE purchase_orders
  ADD COLUMN IF NOT EXISTS po_number TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS expected_date DATE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW();

UPDATE purchase_orders
  SET status = COALESCE(status, 'draft'),
      updated_at = COALESCE(updated_at, created_at, NOW());

UPDATE purchase_orders
  SET created_at = NOW()
  WHERE created_at IS NULL;

ALTER TABLE purchase_orders
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'purchase_orders_status_check'
      AND conrelid = 'purchase_orders'::regclass
  ) THEN
    ALTER TABLE purchase_orders
      ADD CONSTRAINT purchase_orders_status_check
      CHECK (status IN ('draft','issued','receiving','received','cancelled'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_request_id ON purchase_orders(request_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_orders_po_number_unique
  ON purchase_orders(po_number)
  WHERE po_number IS NOT NULL;
