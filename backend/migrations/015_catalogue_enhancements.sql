ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS contract_number TEXT;
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS preferred_suppliers TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS coverage_score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (coverage_score >= 0 AND coverage_score <= 100);
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP DEFAULT NOW();

UPDATE categories
SET last_reviewed_at = COALESCE(last_reviewed_at, created_at);

UPDATE categories
SET preferred_suppliers = ARRAY['Pending assignment']
WHERE preferred_suppliers IS NULL OR array_length(preferred_suppliers, 1) IS NULL;

UPDATE categories
SET contract_number = COALESCE(NULLIF(contract_number, ''), 'CN-' || upper(replace(name, ' ', '-')))
WHERE contract_number IS NULL OR contract_number = '';

ALTER TABLE categories
  ALTER COLUMN preferred_suppliers SET NOT NULL,
  ALTER COLUMN contract_number SET NOT NULL,
  ALTER COLUMN coverage_score SET NOT NULL,
  ALTER COLUMN last_reviewed_at SET NOT NULL;

CREATE TABLE IF NOT EXISTS catalog_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  unit_of_measure TEXT NOT NULL,
  base_price NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  preferred_supplier TEXT NOT NULL,
  contract_number TEXT NOT NULL,
  pricing_tiers JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft','retired')),
  last_reviewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  coverage_notes TEXT,
  UNIQUE (category_id, sku)
);

CREATE TABLE IF NOT EXISTS catalog_vendor_feeds (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  supplier TEXT NOT NULL,
  feed_name TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft','in_review','scheduled','error','published')),
  last_imported_at TIMESTAMP,
  next_refresh_due TIMESTAMP,
  pending_changes INTEGER NOT NULL DEFAULT 0 CHECK (pending_changes >= 0),
  requires_finance_review BOOLEAN NOT NULL DEFAULT true,
  change_log_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (feed_name)
);

CREATE TABLE IF NOT EXISTS punchout_connections (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  supplier TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','maintenance','error','draft')),
  sso_status TEXT NOT NULL CHECK (sso_status IN ('healthy','degraded','offline')),
  cart_success_rate NUMERIC(5,2) CHECK (cart_success_rate >= 0 AND cart_success_rate <= 100),
  last_transaction_at TIMESTAMP,
  coverage_scope TEXT NOT NULL DEFAULT 'enterprise',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_business_units (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS catalog_category_coverage (
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  business_unit_id INTEGER REFERENCES catalog_business_units(id) ON DELETE CASCADE,
  coverage_level TEXT NOT NULL CHECK (coverage_level IN ('full','partial','none')),
  PRIMARY KEY (category_id, business_unit_id)
);

INSERT INTO catalog_business_units (name) VALUES
  ('Engineering'),
  ('Marketing'),
  ('Operations')
ON CONFLICT (name) DO NOTHING;

WITH tech AS (
  INSERT INTO categories(name, monthly_budget, contract_number, preferred_suppliers, coverage_score, last_reviewed_at)
  VALUES (
    'Technology',
    15000,
    'CN-TECH-2024',
    ARRAY['Apple','Adobe','Figma'],
    94.0,
    NOW() - INTERVAL '6 days'
  )
  ON CONFLICT (name) DO UPDATE SET
    monthly_budget = EXCLUDED.monthly_budget,
    contract_number = EXCLUDED.contract_number,
    preferred_suppliers = EXCLUDED.preferred_suppliers,
    coverage_score = EXCLUDED.coverage_score,
    last_reviewed_at = EXCLUDED.last_reviewed_at
  RETURNING id
), workspace AS (
  INSERT INTO categories(name, monthly_budget, contract_number, preferred_suppliers, coverage_score, last_reviewed_at)
  VALUES (
    'Workspace',
    7000,
    'CN-WORK-2024',
    ARRAY['Staples','OfficeMax'],
    72.5,
    NOW() - INTERVAL '12 days'
  )
  ON CONFLICT (name) DO UPDATE SET
    monthly_budget = EXCLUDED.monthly_budget,
    contract_number = EXCLUDED.contract_number,
    preferred_suppliers = EXCLUDED.preferred_suppliers,
    coverage_score = EXCLUDED.coverage_score,
    last_reviewed_at = EXCLUDED.last_reviewed_at
  RETURNING id
)
UPDATE categories AS c
SET parent_id = CASE
  WHEN c.name IN ('Laptops','Software') THEN (SELECT id FROM tech)
  WHEN c.name = 'Office' THEN (SELECT id FROM workspace)
  ELSE c.parent_id
END;

UPDATE categories
SET contract_number = 'CN-LAP-2024',
    preferred_suppliers = ARRAY['Apple','CDW'],
    coverage_score = 92.5,
    last_reviewed_at = NOW() - INTERVAL '8 days'
WHERE name = 'Laptops';

UPDATE categories
SET contract_number = 'CN-SW-2024',
    preferred_suppliers = ARRAY['Adobe','Figma'],
    coverage_score = 88.0,
    last_reviewed_at = NOW() - INTERVAL '4 days'
WHERE name = 'Software';

UPDATE categories
SET contract_number = 'CN-OFF-2024',
    preferred_suppliers = ARRAY['Staples'],
    coverage_score = 64.0,
    last_reviewed_at = NOW() - INTERVAL '15 days'
WHERE name = 'Office';

INSERT INTO catalog_items
  (category_id, name, sku, unit_of_measure, base_price, preferred_supplier, contract_number, pricing_tiers, status, last_reviewed_at, coverage_notes)
SELECT c.id, 'MacBook Pro 14"', 'MBP14-2024', 'Each', 2299.99, 'Apple', 'CN-LAP-2024', '{"1-9":2299.99,"10+":2199.99}', 'active', NOW() - INTERVAL '9 days', 'Price variance flagged vs last quarter'
FROM categories c WHERE c.name = 'Laptops'
ON CONFLICT (category_id, sku) DO NOTHING;

INSERT INTO catalog_items
  (category_id, name, sku, unit_of_measure, base_price, preferred_supplier, contract_number, pricing_tiers, status, last_reviewed_at, coverage_notes)
SELECT c.id, 'Dell Latitude 7450', 'LAT7450', 'Each', 1649.00, 'CDW', 'CN-LAP-2024', '{"1-25":1649.00,"26+":1589.00}', 'active', NOW() - INTERVAL '21 days', NULL
FROM categories c WHERE c.name = 'Laptops'
ON CONFLICT (category_id, sku) DO NOTHING;

INSERT INTO catalog_items
  (category_id, name, sku, unit_of_measure, base_price, preferred_supplier, contract_number, pricing_tiers, status, last_reviewed_at, coverage_notes)
SELECT c.id, 'Adobe Creative Cloud Enterprise', 'ADBE-ENT', 'Seat', 79.99, 'Adobe', 'CN-SW-2024', '{"1-49":79.99,"50+":72.00}', 'active', NOW() - INTERVAL '2 days', NULL
FROM categories c WHERE c.name = 'Software'
ON CONFLICT (category_id, sku) DO NOTHING;

INSERT INTO catalog_items
  (category_id, name, sku, unit_of_measure, base_price, preferred_supplier, contract_number, pricing_tiers, status, last_reviewed_at, coverage_notes)
SELECT c.id, 'Figma Organization Plan', 'FIG-ORG', 'Seat', 45.00, 'Figma', 'CN-SW-2024', '{"1-25":45.00,"26+":41.00}', 'draft', NOW() - INTERVAL '33 days', 'Awaiting security review before publish'
FROM categories c WHERE c.name = 'Software'
ON CONFLICT (category_id, sku) DO NOTHING;

INSERT INTO catalog_items
  (category_id, name, sku, unit_of_measure, base_price, preferred_supplier, contract_number, pricing_tiers, status, last_reviewed_at, coverage_notes)
SELECT c.id, 'Steelcase Gesture Chair', 'SC-GESTURE', 'Each', 980.00, 'Staples', 'CN-OFF-2024', '{"1-10":980.00,"11+":955.00}', 'active', NOW() - INTERVAL '45 days', 'Refresh sourcing data for EMEA offices'
FROM categories c WHERE c.name = 'Office'
ON CONFLICT (category_id, sku) DO NOTHING;

INSERT INTO catalog_vendor_feeds
  (category_id, supplier, feed_name, format, status, last_imported_at, next_refresh_due, pending_changes, requires_finance_review, change_log_url)
SELECT c.id, 'Apple', 'Apple Laptops Q3 Feed', 'cXML', 'in_review', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 4, true, 'https://content.apple.com/feeds/macbook'
FROM categories c WHERE c.name = 'Laptops'
ON CONFLICT (feed_name) DO NOTHING;

INSERT INTO catalog_vendor_feeds
  (category_id, supplier, feed_name, format, status, last_imported_at, next_refresh_due, pending_changes, requires_finance_review, change_log_url)
SELECT c.id, 'Adobe', 'Adobe Enterprise Catalogue', 'API', 'published', NOW() - INTERVAL '1 day', NOW() + INTERVAL '14 days', 0, false, 'https://api.adobe.com/catalog'
FROM categories c WHERE c.name = 'Software'
ON CONFLICT (feed_name) DO NOTHING;

INSERT INTO catalog_vendor_feeds
  (category_id, supplier, feed_name, format, status, last_imported_at, next_refresh_due, pending_changes, requires_finance_review, change_log_url)
SELECT c.id, 'Staples', 'Staples Workspace Essentials', 'CSV', 'scheduled', NOW() - INTERVAL '7 days', NOW() + INTERVAL '1 day', 12, true, 'https://staples.com/catalog-changes'
FROM categories c WHERE c.name = 'Office'
ON CONFLICT (feed_name) DO NOTHING;

INSERT INTO punchout_connections
  (category_id, supplier, status, sso_status, cart_success_rate, last_transaction_at, coverage_scope, notes)
SELECT c.id, 'Apple Store PunchOut', 'active', 'healthy', 98.5, NOW() - INTERVAL '3 hours', 'Global', 'Routes configure-to-order Macs back into approval flows.'
FROM categories c WHERE c.name = 'Laptops'
ON CONFLICT DO NOTHING;

INSERT INTO punchout_connections
  (category_id, supplier, status, sso_status, cart_success_rate, last_transaction_at, coverage_scope, notes)
SELECT c.id, 'CDW PunchOut', 'maintenance', 'degraded', 87.0, NOW() - INTERVAL '16 hours', 'North America', 'Monitoring intermittent SSO assertions.'
FROM categories c WHERE c.name = 'Laptops'
ON CONFLICT DO NOTHING;

INSERT INTO punchout_connections
  (category_id, supplier, status, sso_status, cart_success_rate, last_transaction_at, coverage_scope, notes)
SELECT c.id, 'Staples Advantage PunchOut', 'active', 'healthy', 93.0, NOW() - INTERVAL '1 day', 'US Offices', 'Syncs cart returns directly into facilities requests.'
FROM categories c WHERE c.name = 'Office'
ON CONFLICT DO NOTHING;

INSERT INTO catalog_category_coverage (category_id, business_unit_id, coverage_level)
SELECT c.id, bu.id, 'full'
FROM categories c
JOIN catalog_business_units bu ON bu.name = 'Engineering'
WHERE c.name = 'Laptops'
ON CONFLICT DO NOTHING;

INSERT INTO catalog_category_coverage (category_id, business_unit_id, coverage_level)
SELECT c.id, bu.id, 'partial'
FROM categories c
JOIN catalog_business_units bu ON bu.name = 'Marketing'
WHERE c.name = 'Laptops'
ON CONFLICT DO NOTHING;

INSERT INTO catalog_category_coverage (category_id, business_unit_id, coverage_level)
SELECT c.id, bu.id, 'partial'
FROM categories c
JOIN catalog_business_units bu ON bu.name = 'Engineering'
WHERE c.name = 'Software'
ON CONFLICT DO NOTHING;

INSERT INTO catalog_category_coverage (category_id, business_unit_id, coverage_level)
SELECT c.id, bu.id, 'full'
FROM categories c
JOIN catalog_business_units bu ON bu.name = 'Marketing'
WHERE c.name = 'Software'
ON CONFLICT DO NOTHING;

INSERT INTO catalog_category_coverage (category_id, business_unit_id, coverage_level)
SELECT c.id, bu.id, 'partial'
FROM categories c
JOIN catalog_business_units bu ON bu.name = 'Operations'
WHERE c.name = 'Office'
ON CONFLICT DO NOTHING;

INSERT INTO catalog_category_coverage (category_id, business_unit_id, coverage_level)
SELECT c.id, bu.id, 'none'
FROM categories c
JOIN catalog_business_units bu ON bu.name = 'Engineering'
WHERE c.name = 'Office'
ON CONFLICT DO NOTHING;

