DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'purchase_orders'
      AND tc.constraint_name = 'purchase_orders_request_id_fkey'
      AND ccu.table_name = 'procurement_requests'
  ) THEN
    ALTER TABLE purchase_orders
      DROP CONSTRAINT purchase_orders_request_id_fkey;
  END IF;
END $$;

UPDATE purchase_orders po
SET request_id = NULL
WHERE request_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM requests r
    WHERE r.id = po.request_id
  );

ALTER TABLE purchase_orders
  ADD CONSTRAINT purchase_orders_request_id_fkey
  FOREIGN KEY (request_id)
  REFERENCES requests(id)
  ON DELETE SET NULL;
