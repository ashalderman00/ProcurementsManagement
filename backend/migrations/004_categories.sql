CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  monthly_budget NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monthly_budget >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO categories (name, monthly_budget) VALUES
  ('Laptops', 5000),
  ('Software', 2000),
  ('Office', 1000)
ON CONFLICT (name) DO NOTHING;
