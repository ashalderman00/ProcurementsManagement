CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'requester' CHECK (role IN ('requester','approver','admin')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- seed one approver (you can change later)
-- password will be set at signup; this is just a record if needed
