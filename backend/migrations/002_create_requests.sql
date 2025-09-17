CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
