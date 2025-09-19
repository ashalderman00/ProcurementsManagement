require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('./db');
const Orders = require('./models/order');
const ORDER_STATUSES = (Array.isArray(Orders.ORDER_STATUSES)
  ? Orders.ORDER_STATUSES
  : ['draft', 'issued', 'receiving', 'received', 'cancelled']
).map((status) => status.toLowerCase());
const {
  pickRule,
  materializeStages,
  recomputeRequestStatus,
} = require('./workflow');

const app = express();
const extraRoutes = require('./routes.extras');
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));
const upload = multer({ dest: UPLOAD_DIR });

function formatCurrency(amount) {
  const value = Number(amount) || 0;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function formatCycleTime(hours) {
  if (hours === null || Number.isNaN(hours)) return '—';
  if (hours >= 24) return `${(hours / 24).toFixed(1)} days`;
  return `${hours.toFixed(1)} hrs`;
}

function formatPercent(ratio) {
  if (ratio === null || Number.isNaN(ratio)) return '—';
  return `${(ratio * 100).toFixed(1)}%`;
}

function pluralize(value, singular, plural) {
  const count = Number(value) || 0;
  return `${count} ${count === 1 ? singular : plural}`;
}

function toTitle(value) {
  if (!value) return '';
  return String(value)
    .split(/[\s_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeOrderDate(input) {
  if (input === undefined || input === null || input === '') {
    return { value: null, valid: true };
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return { value: null, valid: false };
  }
  return { value: date.toISOString().slice(0, 10), valid: true };
}

// ===== auth helpers =====
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
function authRequired(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}
function roleRequired(...roles) {
  return (req, res, next) =>
    req.user && roles.includes(req.user.role)
      ? next()
      : res.status(403).json({ error: 'forbidden' });
}

// ===== auth routes =====
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: 'email and password required' });
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      'INSERT INTO users(email,password_hash,role) VALUES($1,$2,$3) RETURNING id,email,role',
      [
        String(email).toLowerCase(),
        hash,
        role && ['requester', 'approver', 'admin'].includes(role)
          ? role
          : 'requester',
      ]
    );
    const user = r.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (e) {
    if (String(e.message).includes('duplicate'))
      return res.status(409).json({ error: 'email taken' });
    res.status(500).json({ error: 'signup failed' });
  }
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [
      String(email).toLowerCase(),
    ]);
    if (!r.rows.length)
      return res.status(401).json({ error: 'invalid credentials' });
    const u = r.rows[0];
    const ok = await bcrypt.compare(password || '', u.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    res.json({
      token: signToken(u),
      user: { id: u.id, email: u.email, role: u.role },
    });
  } catch (e) {
    res.status(500).json({ error: 'login failed' });
  }
});
app.get('/api/me', authRequired, (req, res) =>
  res.json({
    user: { id: req.user.id, email: req.user.email, role: req.user.role },
  })
);

// ===== health =====
app.get('/api/health', async (_req, res) => {
  try {
    const r = await pool.query('SELECT 1 as ok');
    res.json({ api: 'ok', db: r.rows[0].ok === 1 ? 'ok' : 'unknown' });
  } catch (e) {
    res.status(500).json({ api: 'ok', db: 'error', error: e.message || '' });
  }
});

app.get('/api/marketing/landing', async (_req, res) => {
  try {
    const [
      spendRes,
      cycleRowsRes,
      policyRes,
      intakeRes,
      approvalsRes,
      renewalsRes,
      roleProfilesRes,
    ] = await Promise.all([
      pool.query(
        "SELECT COALESCE(SUM(amount),0) AS total_amount FROM requests WHERE status != 'denied'"
      ),
      pool.query(
        `SELECT r.created_at, MAX(ra.acted_at) AS completed_at
           FROM requests r
           JOIN request_approvals ra ON ra.request_id = r.id
          WHERE ra.acted_at IS NOT NULL
          GROUP BY r.id`
      ),
      pool.query(
        `SELECT
            COUNT(*) FILTER (WHERE acted_at IS NOT NULL) AS completed,
            COUNT(*) FILTER (WHERE status='approved' AND acted_at IS NOT NULL) AS approved
           FROM request_approvals`
      ),
      pool.query(
        `SELECT
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS recent,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours' AND status='pending') AS pending_recent
           FROM requests`
      ),
      pool.query(
        `SELECT
            COUNT(*)::int AS approvals_today,
            COALESCE(array_agg(DISTINCT role_required), '{}') AS roles
           FROM request_approvals
          WHERE status='approved'
            AND acted_at >= date_trunc('day', NOW())`
      ),
      pool.query(
        `SELECT
            COUNT(*)::int AS upcoming,
            COUNT(DISTINCT requester_id)::int AS owners
           FROM requests
          WHERE status='approved'
            AND (created_at + INTERVAL '1 year') BETWEEN NOW() AND NOW() + INTERVAL '30 days'`
      ),
      pool.query(
        `SELECT role_id, label, headline, summary, responsibilities, cadence, tools
           FROM marketing_role_profiles
          ORDER BY display_order, label`
      ),
    ]);

    const totalSpend = Number(spendRes.rows[0]?.total_amount || 0);

    const durations = cycleRowsRes.rows
      .map((row) => {
        const created = row.created_at ? new Date(row.created_at) : null;
        const completed = row.completed_at ? new Date(row.completed_at) : null;
        if (
          !created ||
          !completed ||
          Number.isNaN(created.getTime()) ||
          Number.isNaN(completed.getTime())
        )
          return null;
        const diffHours =
          (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
        return diffHours > 0 ? diffHours : null;
      })
      .filter((value) => value !== null)
      .sort((a, b) => a - b);

    let medianHours = null;
    if (durations.length) {
      const mid = Math.floor(durations.length / 2);
      medianHours =
        durations.length % 2 === 0
          ? (durations[mid - 1] + durations[mid]) / 2
          : durations[mid];
    }

    const completedApprovals = Number(policyRes.rows[0]?.completed || 0);
    const approvedApprovals = Number(policyRes.rows[0]?.approved || 0);
    const adherenceRatio = completedApprovals
      ? approvedApprovals / completedApprovals
      : null;

    const recentIntake = Number(intakeRes.rows[0]?.recent || 0);
    const pendingRecent = Number(intakeRes.rows[0]?.pending_recent || 0);

    const approvalsToday = Number(approvalsRes.rows[0]?.approvals_today || 0);
    const rolesToday = Array.isArray(approvalsRes.rows[0]?.roles)
      ? approvalsRes.rows[0].roles.filter(Boolean)
      : [];

    const renewalsUpcoming = Number(renewalsRes.rows[0]?.upcoming || 0);
    const renewalOwners = Number(renewalsRes.rows[0]?.owners || 0);

    const heroMetrics = [
      { label: 'Spend under management', value: formatCurrency(totalSpend) },
      { label: 'Median cycle time', value: formatCycleTime(medianHours) },
      { label: 'Policy adherence', value: formatPercent(adherenceRatio) },
    ];

    const focusSignals = [
      {
        label: 'New intake',
        value: pluralize(recentIntake, 'request', 'requests'),
        meta: pendingRecent
          ? `${pluralize(pendingRecent, 'request awaiting review', 'requests awaiting review')}`
          : 'All triaged',
      },
      {
        label: 'Approvals today',
        value: pluralize(approvalsToday, 'decision', 'decisions'),
        meta: rolesToday.length
          ? rolesToday.map(toTitle).join(' · ')
          : 'No approvals yet',
      },
      {
        label: 'Renewals in 30 days',
        value: pluralize(renewalsUpcoming, 'vendor', 'vendors'),
        meta: renewalOwners
          ? `${pluralize(renewalOwners, 'owner assigned', 'owners assigned')}`
          : 'No owners assigned',
      },
    ];

    const roleViews = roleProfilesRes.rows.map((row) => ({
      id: row.role_id,
      label: row.label,
      headline: row.headline,
      summary: row.summary,
      responsibilities: Array.isArray(row.responsibilities)
        ? row.responsibilities
        : [],
      cadence: Array.isArray(row.cadence) ? row.cadence : [],
      tools: Array.isArray(row.tools) ? row.tools : [],
    }));

    res.json({ heroMetrics, focusSignals, roleViews });
  } catch (error) {
    console.error('marketing landing error', error);
    res.status(500).json({ error: 'failed to load marketing data' });
  }
});

// ===== vendors =====
app.get('/api/vendors', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM vendors ORDER BY name');
  res.json(rows);
});
app.post(
  '/api/vendors',
  authRequired,
  roleRequired('admin'),
  async (req, res) => {
    const {
      name,
      risk = 'low',
      status = 'active',
      website,
      notes,
    } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const { rows } = await pool.query(
      'INSERT INTO vendors(name,risk,status,website,notes) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [name.trim(), risk, status, website || null, notes || null]
    );
    res.status(201).json(rows[0]);
  }
);

app.get('/api/vendors/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid vendor id' });
  const { rows } = await pool.query('SELECT * FROM vendors WHERE id=$1', [id]);
  if (!rows.length) return res.status(404).json({ error: 'vendor not found' });
  res.json(rows[0]);
});

app.patch(
  '/api/vendors/:id',
  authRequired,
  roleRequired('admin'),
  async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid vendor id' });

    const allowedStatus = ['active', 'blocked'];
    const allowedRisk = ['low', 'medium', 'high'];
    const { name, status, risk, website, notes } = req.body || {};

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push(`name=$${updates.length + 1}`);
      values.push(String(name).trim());
    }
    if (status !== undefined) {
      if (!allowedStatus.includes(status))
        return res.status(400).json({ error: 'invalid status' });
      updates.push(`status=$${updates.length + 1}`);
      values.push(status);
    }
    if (risk !== undefined) {
      if (!allowedRisk.includes(risk))
        return res.status(400).json({ error: 'invalid risk' });
      updates.push(`risk=$${updates.length + 1}`);
      values.push(risk);
    }
    if (website !== undefined) {
      updates.push(`website=$${updates.length + 1}`);
      values.push(website ? String(website) : null);
    }
    if (notes !== undefined) {
      updates.push(`notes=$${updates.length + 1}`);
      values.push(notes === null ? null : String(notes));
    }

    if (!updates.length)
      return res.status(400).json({ error: 'no fields to update' });

    try {
      const { rows } = await pool.query(
        `UPDATE vendors SET ${updates.join(', ')} WHERE id=$${updates.length + 1} RETURNING *`,
        [...values, id]
      );
      if (!rows.length)
        return res.status(404).json({ error: 'vendor not found' });
      res.json(rows[0]);
    } catch (e) {
      console.error('vendor update failed', e);
      res.status(500).json({ error: 'update failed' });
    }
  }
);

// ===== categories (kept) =====
app.get('/api/categories', async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id,name,monthly_budget FROM categories ORDER BY name'
  );
  res.json(rows);
});
app.post(
  '/api/categories',
  authRequired,
  roleRequired('admin', 'approver'),
  async (req, res) => {
    const { name, monthly_budget = 0 } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const budget = Number(monthly_budget) || 0;
    const { rows } = await pool.query(
      'INSERT INTO categories(name,monthly_budget) VALUES($1,$2) RETURNING *',
      [name.trim(), budget]
    );
    res.status(201).json(rows[0]);
  }
);

// ===== approval rules (policy data) =====
app.get(
  '/api/approval-rules',
  authRequired,
  roleRequired('admin'),
  async (_req, res) => {
    const { rows } = await pool.query(
      'SELECT * FROM approval_rules WHERE active=true ORDER BY min_amount'
    );
    res.json(rows);
  }
);
app.post(
  '/api/approval-rules',
  authRequired,
  roleRequired('admin'),
  async (req, res) => {
    const {
      name,
      min_amount = 0,
      max_amount = null,
      category_id = null,
      vendor_id = null,
      stages = [],
    } = req.body || {};
    if (!name || !Array.isArray(stages) || stages.length === 0)
      return res.status(400).json({ error: 'name & stages required' });
    const { rows } = await pool.query(
      'INSERT INTO approval_rules(name,min_amount,max_amount,category_id,vendor_id,stages,active) VALUES($1,$2,$3,$4,$5,$6,true) RETURNING *',
      [
        name,
        Number(min_amount) || 0,
        max_amount === null ? null : Number(max_amount),
        category_id,
        vendor_id,
        JSON.stringify(stages),
      ]
    );
    res.status(201).json(rows[0]);
  }
);

app.patch(
  '/api/approval-rules/:id',
  authRequired,
  roleRequired('admin'),
  async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid rule id' });

    const {
      name,
      min_amount,
      max_amount,
      category_id,
      vendor_id,
      stages,
      active,
    } = req.body || {};

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push(`name=$${updates.length + 1}`);
      values.push(String(name));
    }
    if (min_amount !== undefined) {
      const min = Number(min_amount);
      if (Number.isNaN(min))
        return res.status(400).json({ error: 'invalid min_amount' });
      updates.push(`min_amount=$${updates.length + 1}`);
      values.push(min);
    }
    if (max_amount !== undefined) {
      let max = null;
      if (max_amount !== null && max_amount !== '') {
        max = Number(max_amount);
        if (Number.isNaN(max))
          return res.status(400).json({ error: 'invalid max_amount' });
      }
      updates.push(`max_amount=$${updates.length + 1}`);
      values.push(max);
    }
    if (category_id !== undefined) {
      let cat = null;
      if (category_id !== null && category_id !== '') {
        cat = Number(category_id);
        if (Number.isNaN(cat))
          return res.status(400).json({ error: 'invalid category_id' });
      }
      updates.push(`category_id=$${updates.length + 1}`);
      values.push(cat);
    }
    if (vendor_id !== undefined) {
      let vendor = null;
      if (vendor_id !== null && vendor_id !== '') {
        vendor = Number(vendor_id);
        if (Number.isNaN(vendor))
          return res.status(400).json({ error: 'invalid vendor_id' });
      }
      updates.push(`vendor_id=$${updates.length + 1}`);
      values.push(vendor);
    }
    if (stages !== undefined) {
      if (!Array.isArray(stages) || !stages.length)
        return res.status(400).json({ error: 'stages must be a non-empty array' });
      updates.push(`stages=$${updates.length + 1}`);
      values.push(JSON.stringify(stages));
    }
    if (active !== undefined) {
      updates.push(`active=$${updates.length + 1}`);
      const nextActive =
        typeof active === 'string' ? active.toLowerCase() === 'true' : Boolean(active);
      values.push(nextActive);
    }

    if (!updates.length)
      return res.status(400).json({ error: 'no fields to update' });

    try {
      const { rows } = await pool.query(
        `UPDATE approval_rules SET ${updates.join(', ')} WHERE id=$${updates.length + 1} RETURNING *`,
        [...values, id]
      );
      if (!rows.length)
        return res.status(404).json({ error: 'rule not found' });
      res.json(rows[0]);
    } catch (e) {
      console.error('approval rule update failed', e);
      res.status(500).json({ error: 'update failed' });
    }
  }
);

app.delete(
  '/api/approval-rules/:id',
  authRequired,
  roleRequired('admin'),
  async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid rule id' });
    try {
      const result = await pool.query('DELETE FROM approval_rules WHERE id=$1', [id]);
      if (!result.rowCount)
        return res.status(404).json({ error: 'rule not found' });
      res.json({ ok: true });
    } catch (e) {
      console.error('approval rule delete failed', e);
      res.status(500).json({ error: 'delete failed' });
    }
  }
);

// ===== requests with vendor, policy-driven stages =====
app.get('/api/requests', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT r.id,r.title,r.amount,r.status,r.created_at,r.category_id,c.name AS category_name,
            r.vendor_id,v.name AS vendor_name, r.po_number
       FROM requests r
       LEFT JOIN categories c ON c.id=r.category_id
       LEFT JOIN vendors v ON v.id=r.vendor_id
     ORDER BY r.created_at DESC`
  );
  res.json(rows);
});

app.get('/api/requests/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid request id' });

  try {
    const { rows } = await pool.query(
      `SELECT r.id,r.title,r.amount,r.status,r.created_at,r.category_id,c.name AS category_name,
              r.vendor_id,v.name AS vendor_name, r.po_number
         FROM requests r
         LEFT JOIN categories c ON c.id=r.category_id
         LEFT JOIN vendors v ON v.id=r.vendor_id
        WHERE r.id=$1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'request not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error('request fetch failed', e);
    res.status(500).json({ error: 'failed to fetch request' });
  }
});

app.get('/api/requests/:id/approvals', authRequired, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM request_approvals WHERE request_id=$1 ORDER BY stage_index',
    [Number(req.params.id)]
  );
  res.json(rows);
});

app.post('/api/requests', authRequired, async (req, res) => {
  const client = await pool.connect();
  try {
    const { title, amount, category_id, vendor_id, po_number } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt < 0)
      return res.status(400).json({ error: 'invalid amount' });

    await client.query('BEGIN');
    const ins = await client.query(
      `INSERT INTO requests(title,amount,category_id,requester_id,vendor_id,po_number)
       VALUES($1,$2,$3,$4,$5,$6)
       RETURNING id,title,amount,status,created_at,category_id,vendor_id,po_number`,
      [
        title.trim(),
        amt,
        category_id || null,
        req.user.id,
        vendor_id || null,
        po_number || null,
      ]
    );
    const reqRow = ins.rows[0];

    const rulesQ = await client.query(
      'SELECT * FROM approval_rules WHERE active=true ORDER BY min_amount'
    );
    const rule = pickRule({
      amount: amt,
      category_id: category_id || null,
      vendor_id: vendor_id || null,
      rules: rulesQ.rows,
    });
    const stages = rule ? JSON.parse(rule.stages) : ['approver']; // fallback single approver

    await materializeStages(client, reqRow.id, stages);
    await client.query(
      'INSERT INTO audit_log(object_type, object_id, action, actor_id, meta) VALUES($1,$2,$3,$4,$5)',
      [
        'request',
        reqRow.id,
        'create',
        req.user.id,
        JSON.stringify({ amount: amt, category_id, vendor_id, po_number }),
      ]
    );
    await client.query('COMMIT');
    res.status(201).json(reqRow);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('create request error:', e.message);
    res.status(500).json({ error: 'failed to create' });
  } finally {
    client.release();
  }
});

app.patch(
  '/api/requests/:id',
  authRequired,
  roleRequired('admin', 'approver'),
  async (req, res) => {
    const requestId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(requestId))
      return res.status(400).json({ error: 'invalid request id' });

    const rawStatus = req.body?.status;
    const status = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : '';
    const allowed = ['pending', 'approved', 'denied'];
    if (!allowed.includes(status))
      return res.status(400).json({ error: 'invalid status' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query(
        'SELECT id FROM requests WHERE id=$1 FOR UPDATE',
        [requestId]
      );
      if (!existing.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'request not found' });
      }

      await client.query('UPDATE requests SET status=$1 WHERE id=$2', [status, requestId]);

      if (status === 'pending') {
        await client.query(
          'UPDATE request_approvals SET status=$1, acted_by=NULL, acted_at=NULL WHERE request_id=$2',
          ['pending', requestId]
        );
      } else {
        await client.query(
          'UPDATE request_approvals SET status=$1, acted_by=$2, acted_at=NOW() WHERE request_id=$3 AND status=$4',
          [status, req.user.id, requestId, 'pending']
        );
      }

      await recomputeRequestStatus(client, requestId);

      await client
        .query(
          'INSERT INTO audit_log(object_type, object_id, action, actor_id, meta) VALUES($1,$2,$3,$4,$5)',
          [
            'request',
            requestId,
            'status_override',
            req.user.id,
            JSON.stringify({ status }),
          ]
        )
        .catch(() => {});

      const detail = await client.query(
        `SELECT r.id,r.title,r.amount,r.status,r.created_at,r.category_id,c.name AS category_name,
                r.vendor_id,v.name AS vendor_name, r.po_number
           FROM requests r
           LEFT JOIN categories c ON c.id=r.category_id
           LEFT JOIN vendors v ON v.id=r.vendor_id
          WHERE r.id=$1`,
        [requestId]
      );

      await client.query('COMMIT');

      if (!detail.rows.length)
        return res.status(404).json({ error: 'request not found' });
      res.json(detail.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('request status update failed', e);
      res.status(500).json({ error: 'update failed' });
    } finally {
      client.release();
    }
  }
);

// stage approve/deny (enforce role per stage)
app.post('/api/requests/:id/approve', authRequired, async (req, res) => {
  const client = await pool.connect();
  try {
    const request_id = Number(req.params.id);
    await client.query('BEGIN');
    const { rows: stages } = await client.query(
      'SELECT * FROM request_approvals WHERE request_id=$1 ORDER BY stage_index FOR UPDATE',
      [request_id]
    );
    const open = stages.find((s) => s.status === 'pending');
    if (!open) return res.status(400).json({ error: 'no pending stage' });
    if (req.user.role !== open.role_required && req.user.role !== 'admin')
      return res.status(403).json({ error: 'wrong role for this stage' });

    await client.query(
      'UPDATE request_approvals SET status=$1, acted_by=$2, acted_at=NOW() WHERE id=$3',
      ['approved', req.user.id, open.id]
    );
    await recomputeRequestStatus(client, request_id);
    await client.query(
      'INSERT INTO audit_log(object_type,object_id,action,actor_id,meta) VALUES($1,$2,$3,$4,$5)',
      [
        'request',
        request_id,
        'approve',
        req.user.id,
        JSON.stringify({ stage_index: open.stage_index }),
      ]
    );
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'approve failed' });
  } finally {
    client.release();
  }
});

app.post('/api/requests/:id/deny', authRequired, async (req, res) => {
  const client = await pool.connect();
  try {
    const request_id = Number(req.params.id);
    await client.query('BEGIN');
    const { rows: stages } = await client.query(
      'SELECT * FROM request_approvals WHERE request_id=$1 ORDER BY stage_index FOR UPDATE',
      [request_id]
    );
    const open = stages.find((s) => s.status === 'pending');
    if (!open) return res.status(400).json({ error: 'no pending stage' });
    if (req.user.role !== open.role_required && req.user.role !== 'admin')
      return res.status(403).json({ error: 'wrong role for this stage' });

    await client.query(
      'UPDATE request_approvals SET status=$1, acted_by=$2, acted_at=NOW() WHERE id=$3',
      ['denied', req.user.id, open.id]
    );
    await recomputeRequestStatus(client, request_id);
    await client.query(
      'INSERT INTO audit_log(object_type,object_id,action,actor_id,meta) VALUES($1,$2,$3,$4,$5)',
      [
        'request',
        request_id,
        'deny',
        req.user.id,
        JSON.stringify({ stage_index: open.stage_index }),
      ]
    );
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'deny failed' });
  } finally {
    client.release();
  }
});

// files (keep)
app.post(
  '/api/requests/:id/files',
  authRequired,
  upload.single('file'),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!req.file) return res.status(400).json({ error: 'file required' });
      const url = `/uploads/${req.file.filename}`;
      const r = await pool.query(
        'INSERT INTO request_files(request_id,filename,url) VALUES($1,$2,$3) RETURNING *',
        [id, req.file.originalname, url]
      );
      res.status(201).json(r.rows[0]);
    } catch (e) {
      res.status(500).json({ error: 'upload failed' });
    }
  }
);
app.get('/api/requests/:id/files', authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await pool.query(
    'SELECT id,filename,url,created_at FROM request_files WHERE request_id=$1 ORDER BY created_at DESC',
    [id]
  );
  res.json(rows);
});

// ===== purchase orders =====
app.get('/api/orders', async (_req, res) => {
  try {
    const rows = await Orders.getAll();
    res.json(rows);
  } catch (error) {
    console.error('orders.list.error', error);
    res.status(500).json({ error: 'failed to load orders' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const orderId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(orderId)) {
    return res.status(400).json({ error: 'invalid order id' });
  }
  try {
    const order = await Orders.findById(orderId);
    if (!order) return res.status(404).json({ error: 'order not found' });
    res.json(order);
  } catch (error) {
    console.error('orders.detail.error', error);
    res.status(500).json({ error: 'failed to load order' });
  }
});

app.post(
  '/api/orders',
  authRequired,
  roleRequired('admin', 'approver'),
  async (req, res) => {
    try {
      const body = req.body || {};
      const totalRaw = body.total ?? body.amount ?? body.value;
      const total = Number(totalRaw);
      if (Number.isNaN(total) || total < 0) {
        return res.status(400).json({ error: 'invalid total amount' });
      }

      const statusRaw =
        typeof body.status === 'string' ? body.status.toLowerCase().trim() : 'draft';
      if (body.status !== undefined && !ORDER_STATUSES.includes(statusRaw)) {
        return res.status(400).json({ error: 'invalid status' });
      }

      let vendorId = body.vendor_id ?? body.vendorId;
      let vendorName = body.vendor_name ?? body.vendorName ?? body.vendor;
      if (vendorId !== undefined && vendorId !== null && vendorId !== '') {
        vendorId = Number(vendorId);
        if (Number.isNaN(vendorId)) {
          return res.status(400).json({ error: 'invalid vendor id' });
        }
        const vendorRes = await pool.query('SELECT id,name FROM vendors WHERE id=$1', [vendorId]);
        if (!vendorRes.rowCount) {
          return res.status(404).json({ error: 'vendor not found' });
        }
        vendorName = vendorRes.rows[0].name;
      } else {
        vendorId = null;
      }

      if (!vendorName || !String(vendorName).trim()) {
        return res.status(400).json({ error: 'vendor name required' });
      }
      vendorName = String(vendorName).trim();

      let requestId = body.request_id ?? body.requestId;
      if (requestId !== undefined && requestId !== null && requestId !== '') {
        requestId = Number(requestId);
        if (Number.isNaN(requestId)) {
          return res.status(400).json({ error: 'invalid request id' });
        }
        const reqRes = await pool.query('SELECT id FROM requests WHERE id=$1', [requestId]);
        if (!reqRes.rowCount) {
          return res.status(404).json({ error: 'request not found' });
        }
      } else {
        requestId = null;
      }

      const poRaw = body.po_number ?? body.poNumber ?? body.number;
      const poNumber = poRaw && String(poRaw).trim() ? String(poRaw).trim() : null;

      const expectedRaw =
        body.expected_date ?? body.expectedDate ?? body.due_date ?? body.dueDate;
      const parsedExpected = normalizeOrderDate(expectedRaw);
      if (expectedRaw && !parsedExpected.valid) {
        return res.status(400).json({ error: 'invalid expected date' });
      }

      const notesRaw = body.notes ?? body.memo;
      const notes =
        notesRaw === undefined || notesRaw === null
          ? null
          : String(notesRaw).trim() || null;

      const created = await Orders.create({
        po_number: poNumber,
        vendor_name: vendorName,
        vendor_id: vendorId,
        total,
        status: statusRaw || 'draft',
        request_id: requestId,
        expected_date: parsedExpected.value,
        notes,
      });

      res.status(201).json(created);
    } catch (error) {
      console.error('orders.create.error', error);
      res.status(500).json({ error: 'failed to create order' });
    }
  }
);

app.patch(
  '/api/orders/:id',
  authRequired,
  roleRequired('admin', 'approver'),
  async (req, res) => {
    const orderId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(orderId)) {
      return res.status(400).json({ error: 'invalid order id' });
    }

    const body = req.body || {};
    const updates = {};

    if ('po_number' in body || 'poNumber' in body || 'number' in body) {
      const raw = body.po_number ?? body.poNumber ?? body.number;
      updates.po_number = raw && String(raw).trim() ? String(raw).trim() : null;
    }

    if ('total' in body || 'amount' in body || 'value' in body) {
      const raw = body.total ?? body.amount ?? body.value;
      const amount = Number(raw);
      if (Number.isNaN(amount) || amount < 0) {
        return res.status(400).json({ error: 'invalid total amount' });
      }
      updates.total = amount;
    }

    if ('status' in body) {
      const statusValue =
        typeof body.status === 'string' ? body.status.toLowerCase().trim() : '';
      if (!ORDER_STATUSES.includes(statusValue)) {
        return res.status(400).json({ error: 'invalid status' });
      }
      updates.status = statusValue;
    }

    if ('vendor_id' in body || 'vendorId' in body) {
      const raw = body.vendor_id ?? body.vendorId;
      if (raw === null || raw === undefined || raw === '') {
        updates.vendor_id = null;
      } else {
        const vendorId = Number(raw);
        if (Number.isNaN(vendorId)) {
          return res.status(400).json({ error: 'invalid vendor id' });
        }
        const vendorRes = await pool.query('SELECT id,name FROM vendors WHERE id=$1', [vendorId]);
        if (!vendorRes.rowCount) {
          return res.status(404).json({ error: 'vendor not found' });
        }
        updates.vendor_id = vendorId;
        updates.vendor_name = vendorRes.rows[0].name;
      }
    }

    if ('vendor_name' in body || 'vendorName' in body || 'vendor' in body) {
      const raw = body.vendor_name ?? body.vendorName ?? body.vendor;
      if (raw && String(raw).trim()) {
        updates.vendor_name = String(raw).trim();
      } else {
        return res.status(400).json({ error: 'vendor name required' });
      }
    }

    if ('request_id' in body || 'requestId' in body) {
      const raw = body.request_id ?? body.requestId;
      if (raw === null || raw === undefined || raw === '') {
        updates.request_id = null;
      } else {
        const requestId = Number(raw);
        if (Number.isNaN(requestId)) {
          return res.status(400).json({ error: 'invalid request id' });
        }
        const reqRes = await pool.query('SELECT id FROM requests WHERE id=$1', [requestId]);
        if (!reqRes.rowCount) {
          return res.status(404).json({ error: 'request not found' });
        }
        updates.request_id = requestId;
      }
    }

    if ('expected_date' in body || 'expectedDate' in body || 'due_date' in body || 'dueDate' in body) {
      const raw =
        body.expected_date ?? body.expectedDate ?? body.due_date ?? body.dueDate;
      const parsed = normalizeOrderDate(raw);
      if (raw && !parsed.valid) {
        return res.status(400).json({ error: 'invalid expected date' });
      }
      updates.expected_date = parsed.value;
    }

    if ('notes' in body || 'memo' in body) {
      const raw = body.notes ?? body.memo;
      if (raw === null || raw === undefined) {
        updates.notes = null;
      } else {
        updates.notes = String(raw).trim() || null;
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'no fields to update' });
    }

    try {
      const updated = await Orders.update(orderId, updates);
      if (!updated) return res.status(404).json({ error: 'order not found' });
      res.json(updated);
    } catch (error) {
      console.error('orders.update.error', error);
      res.status(500).json({ error: 'failed to update order' });
    }
  }
);

app.delete(
  '/api/orders/:id',
  authRequired,
  roleRequired('admin', 'approver'),
  async (req, res) => {
    const orderId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(orderId)) {
      return res.status(400).json({ error: 'invalid order id' });
    }
    try {
      const removed = await Orders.remove(orderId);
      if (!removed) return res.status(404).json({ error: 'order not found' });
      res.status(204).end();
    } catch (error) {
      console.error('orders.delete.error', error);
      res.status(500).json({ error: 'failed to delete order' });
    }
  }
);

if (typeof extraRoutes === 'function')
  extraRoutes(app, pool, authRequired, roleRequired);
else if (extraRoutes && typeof extraRoutes.extend === 'function')
  extraRoutes.extend(app, pool, authRequired, roleRequired);
if (extraRoutes && typeof extraRoutes.extendComments === 'function')
  extraRoutes.extendComments(app, pool, authRequired);
app.listen(PORT, () =>
  console.log(`Backend listening on http://localhost:${PORT}`)
);
