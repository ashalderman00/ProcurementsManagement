-- Align legacy users table with current auth requirements
ALTER TABLE users DROP COLUMN IF EXISTS name;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

UPDATE users
SET password_hash = '$2a$10$l1h8tiwiI8z.Gw2tHTmA8.528CXk0yrNC7d4cE5cfUV0bHa15sVge'
WHERE password_hash IS NULL OR password_hash = '';

UPDATE users
SET role = 'requester'
WHERE role IS NULL OR role NOT IN ('requester','approver','admin');

UPDATE users
SET created_at = NOW()
WHERE created_at IS NULL;

ALTER TABLE users
  ALTER COLUMN password_hash SET NOT NULL,
  ALTER COLUMN role SET NOT NULL,
  ALTER COLUMN role SET DEFAULT 'requester',
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('requester','approver','admin'));
