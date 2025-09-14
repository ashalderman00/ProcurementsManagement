-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

-- Procurement requests
CREATE TABLE IF NOT EXISTS procurement_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approvals
CREATE TABLE IF NOT EXISTS approvals (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES procurement_requests(id),
  approver_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES procurement_requests(id),
  vendor TEXT NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
