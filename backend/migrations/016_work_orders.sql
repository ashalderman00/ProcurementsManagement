CREATE TABLE IF NOT EXISTS work_orders (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    details TEXT,
    requester_name TEXT,
    requester_email TEXT,
    priority TEXT NOT NULL DEFAULT 'normal',
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS work_orders_status_idx ON work_orders(status);
CREATE INDEX IF NOT EXISTS work_orders_due_date_idx ON work_orders(due_date);
