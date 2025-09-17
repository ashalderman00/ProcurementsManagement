CREATE TABLE IF NOT EXISTS request_approvals (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  stage_index INTEGER NOT NULL,           -- 0..N-1
  role_required TEXT NOT NULL,            -- approver/admin/etc
  status TEXT NOT NULL DEFAULT 'pending'  -- pending/approved/denied
    CHECK (status IN ('pending','approved','denied')),
  acted_by INTEGER REFERENCES users(id),
  acted_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_req_stage_unique
ON request_approvals (request_id, stage_index);
