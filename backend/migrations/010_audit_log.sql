CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  object_type TEXT NOT NULL,     -- 'request','approval','vendor'
  object_id INTEGER NOT NULL,
  action TEXT NOT NULL,          -- 'create','update','approve','deny','comment'
  actor_id INTEGER REFERENCES users(id),
  meta JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
