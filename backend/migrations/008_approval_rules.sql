CREATE TABLE IF NOT EXISTS approval_rules (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  min_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_amount NUMERIC(12,2), -- null means no upper bound
  category_id INTEGER REFERENCES categories(id),
  vendor_id INTEGER REFERENCES vendors(id),
  stages TEXT NOT NULL, -- JSON array of roles, e.g. '["approver","admin"]'
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
-- example rules
INSERT INTO approval_rules (name, min_amount, max_amount, stages, active)
VALUES
  ('Default < $1k', 0, 1000, '["approver"]', TRUE),
  ('Default $1k–$5k', 1000, 5000, '["approver","admin"]', TRUE)
ON CONFLICT DO NOTHING;
