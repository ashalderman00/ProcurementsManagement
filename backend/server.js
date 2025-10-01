require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
const ALLOWED_ROLES = ['requester', 'approver', 'buyer', 'finance', 'admin'];
const ALLOWED_ROLE_SET = new Set(ALLOWED_ROLES);

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

function normalizeTextArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined || value === '') return [];
  if (typeof value === 'string') {
    return value
      .replace(/^[{]|[}]$/g, '')
      .split(',')
      .map((entry) => entry.trim().replace(/^"|"$/g, ''))
      .filter(Boolean);
  }
  return [];
}

const WORK_ORDER_PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const WORK_ORDER_STATUSES = ['submitted', 'in-progress', 'scheduled', 'completed', 'cancelled'];
const WORK_ORDER_PRIORITY_SET = new Set(WORK_ORDER_PRIORITIES);
const WORK_ORDER_STATUS_SET = new Set(WORK_ORDER_STATUSES);

function normalizeWorkOrderPriority(value) {
  const priority = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (WORK_ORDER_PRIORITY_SET.has(priority)) return priority;
  return 'normal';
}

function normalizeWorkOrderStatus(value) {
  const status = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (WORK_ORDER_STATUS_SET.has(status)) return status;
  return null;
}

function sanitizeWorkOrderRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    details: row.details,
    requesterName: row.requester_name,
    requesterEmail: row.requester_email,
    priority: row.priority,
    dueDate: row.due_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function latestDate(values) {
  let latest = null;
  for (const value of values) {
    const date = parseDateValue(value);
    if (!date) continue;
    if (!latest || date > latest) latest = date;
  }
  return latest;
}

function isOlderThan(value, days) {
  const date = parseDateValue(value);
  if (!date) return false;
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return date.getTime() < threshold;
}

function average(values) {
  if (!Array.isArray(values) || !values.length) return null;
  const filtered = values.filter((value) => Number.isFinite(value));
  if (!filtered.length) return null;
  const total = filtered.reduce((sum, value) => sum + value, 0);
  return total / filtered.length;
}

// ===== auth helpers =====
function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function isValidEmail(value) {
  const email = String(value || '').trim();
  if (!email) return false;
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function normalizeRole(value, fallback = 'requester') {
  const role = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return ALLOWED_ROLE_SET.has(role) ? role : fallback;
}

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
function generatePassword(length = 12) {
  const result = [];
  const charsetLength = PASSWORD_CHARS.length;
  if (!charsetLength) return 'changeme123';
  while (result.length < length) {
    const buf = crypto.randomBytes(length);
    for (let i = 0; i < buf.length && result.length < length; i += 1) {
      const byte = buf[i];
      const max = charsetLength * Math.floor(256 / charsetLength);
      if (byte < max) {
        result.push(PASSWORD_CHARS[byte % charsetLength]);
      }
    }
  }
  return result.join('');
}

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
    const identifier = normalizeEmail(email);
    if (!identifier || !password)
      return res.status(400).json({ error: 'email and password required' });
    const hash = await bcrypt.hash(String(password), 10);
    const r = await pool.query(
      'INSERT INTO users(email,password_hash,role) VALUES($1,$2,$3) RETURNING id,email,role',
      [
        identifier,
        hash,
        normalizeRole(role),
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
    const identifier = normalizeEmail(email);
    if (!identifier || !password)
      return res.status(400).json({ error: 'email and password required' });
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [
      identifier,
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

app.get('/api/users', authRequired, roleRequired('admin'), async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id,email,role,created_at FROM users ORDER BY created_at DESC, email ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('users.list.error', error);
    res.status(500).json({ error: 'failed to load users' });
  }
});

app.post('/api/users', authRequired, roleRequired('admin'), async (req, res) => {
  try {
    const { email, role, password } = req.body || {};
    const identifier = normalizeEmail(email);
    if (!identifier)
      return res.status(400).json({ error: 'valid email is required' });

    let rawPassword = typeof password === 'string' ? password.trim() : '';
    let temporaryPassword = null;
    if (!rawPassword) {
      temporaryPassword = generatePassword(12);
      rawPassword = temporaryPassword;
    }

    const hash = await bcrypt.hash(rawPassword, 10);
    const normalizedRole = normalizeRole(role);

    const { rows } = await pool.query(
      'INSERT INTO users(email,password_hash,role) VALUES($1,$2,$3) RETURNING id,email,role,created_at',
      [identifier, hash, normalizedRole]
    );
    const user = rows[0];
    res.status(201).json({ user, temporaryPassword });
  } catch (error) {
    if (String(error.message || '').includes('duplicate')) {
      return res.status(409).json({ error: 'email taken' });
    }
    console.error('users.create.error', error);
    res.status(500).json({ error: 'failed to create user' });
  }
});

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

// ===== work orders =====
app.get(
  '/api/work-orders',
  authRequired,
  roleRequired('admin', 'buyer', 'approver', 'finance'),
  async (_req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT id,title,details,requester_name,requester_email,priority,due_date,status,created_at,updated_at
           FROM work_orders
         ORDER BY created_at DESC`
      );
      res.json(rows.map((row) => sanitizeWorkOrderRow(row)));
    } catch (error) {
      console.error('work-orders.list.error', error);
      res.status(500).json({ error: 'failed to load work orders' });
    }
  }
);

app.post('/api/work-orders', async (req, res) => {
  try {
    const {
      title,
      details,
      requesterName,
      requesterEmail,
      priority,
      dueDate,
    } = req.body || {};

    const normalizedTitle = typeof title === 'string' ? title.trim() : '';
    if (!normalizedTitle) {
      return res.status(400).json({ error: 'title required' });
    }

    const normalizedDetails =
      details === undefined || details === null
        ? null
        : String(details).trim() || null;

    const normalizedName =
      requesterName === undefined || requesterName === null
        ? null
        : String(requesterName).trim() || null;

    let normalizedEmail = null;
    if (requesterEmail !== undefined && requesterEmail !== null && String(requesterEmail).trim()) {
      const email = normalizeEmail(requesterEmail);
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'invalid requester email' });
      }
      normalizedEmail = email;
    }

    const normalizedPriority = normalizeWorkOrderPriority(priority);
    const { value: dueDateValue, valid: dueDateValid } = normalizeOrderDate(dueDate);
    if (!dueDateValid) {
      return res.status(400).json({ error: 'invalid due date' });
    }

    const metadata = {
      source: 'landing',
      userAgent: req.get('user-agent') || null,
    };
    const metadataJson = JSON.stringify(metadata);

    const { rows } = await pool.query(
      `INSERT INTO work_orders(title, details, requester_name, requester_email, priority, due_date, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,($7)::jsonb)
       RETURNING id,title,details,requester_name,requester_email,priority,due_date,status,created_at,updated_at`,
      [
        normalizedTitle,
        normalizedDetails,
        normalizedName,
        normalizedEmail,
        normalizedPriority,
        dueDateValue,
        metadataJson,
      ]
    );

    res.status(201).json(sanitizeWorkOrderRow(rows[0]));
  } catch (error) {
    console.error('work-orders.create.error', error);
    res.status(500).json({ error: 'failed to submit work order' });
  }
});

app.patch(
  '/api/work-orders/:id/status',
  authRequired,
  roleRequired('admin', 'buyer', 'approver', 'finance'),
  async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid work order id' });

    const status = normalizeWorkOrderStatus(req.body?.status);
    if (!status) return res.status(400).json({ error: 'invalid status' });

    try {
      const { rows } = await pool.query(
        `UPDATE work_orders
            SET status=$1,
                updated_at=NOW()
          WHERE id=$2
      RETURNING id,title,details,requester_name,requester_email,priority,due_date,status,created_at,updated_at`,
        [status, id]
      );
      if (!rows.length) return res.status(404).json({ error: 'work order not found' });
      res.json(sanitizeWorkOrderRow(rows[0]));
    } catch (error) {
      console.error('work-orders.update.error', error);
      res.status(500).json({ error: 'failed to update work order' });
    }
  }
);

// ===== vendors =====
app.get('/api/vendors', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM vendors ORDER BY name');
  res.json(rows);
});
app.post(
  '/api/vendors',
  authRequired,
  roleRequired('admin', 'buyer'),
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
  roleRequired('admin', 'buyer'),
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
    `SELECT id, name, monthly_budget, parent_id, contract_number, preferred_suppliers, coverage_score, last_reviewed_at
       FROM categories
      ORDER BY name`
  );
  res.json(rows);
});
app.post(
  '/api/categories',
  authRequired,
  roleRequired('admin', 'approver'),
  async (req, res) => {
    const {
      name,
      monthly_budget = 0,
      parent_id = null,
      contract_number,
      preferred_suppliers = [],
      coverage_score = 0,
    } = req.body || {};

    if (!name) return res.status(400).json({ error: 'name required' });
    if (!contract_number)
      return res.status(400).json({ error: 'contract_number required' });

    const budget = Number(monthly_budget);
    if (Number.isNaN(budget) || budget < 0)
      return res.status(400).json({ error: 'invalid monthly_budget' });

    const parentId =
      parent_id === null || parent_id === '' ? null : Number(parent_id);
    if (parentId !== null && Number.isNaN(parentId))
      return res.status(400).json({ error: 'invalid parent_id' });

    const suppliers = Array.isArray(preferred_suppliers)
      ? preferred_suppliers.map((value) => String(value).trim()).filter(Boolean)
      : [];
    if (!suppliers.length)
      return res.status(400).json({ error: 'preferred_suppliers required' });

    let coverage = Number(coverage_score);
    if (coverage_score === '' || coverage_score === null || coverage_score === undefined)
      coverage = 0;
    if (Number.isNaN(coverage) || coverage < 0 || coverage > 100)
      return res
        .status(400)
        .json({ error: 'coverage_score must be between 0 and 100' });

    try {
      const { rows } = await pool.query(
        'INSERT INTO categories(name,monthly_budget,parent_id,contract_number,preferred_suppliers,coverage_score) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
        [name.trim(), budget, parentId, contract_number.trim(), suppliers, coverage]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('category.create.error', error);
      const message = String(error.message || '').toLowerCase();
      if (message.includes('duplicate'))
        return res.status(409).json({ error: 'category already exists' });
      if (message.includes('foreign key'))
        return res.status(400).json({ error: 'parent category not found' });
      res.status(500).json({ error: 'failed to create category' });
    }
  }
);

app.get('/api/catalogue/overview', async (_req, res) => {
  try {
    const [categoryRes, itemRes, coverageRes, feedRes, punchoutRes] =
      await Promise.all([
        pool.query(
          `SELECT c.id, c.name, c.monthly_budget, c.parent_id, p.name AS parent_name,
                  c.contract_number, c.preferred_suppliers, c.coverage_score, c.last_reviewed_at
             FROM categories c
             LEFT JOIN categories p ON p.id = c.parent_id
            ORDER BY COALESCE(p.name, c.name), c.name`
        ),
        pool.query(
          `SELECT i.id, i.category_id, i.name, i.sku, i.unit_of_measure, i.base_price, i.currency,
                  i.preferred_supplier, i.contract_number, i.pricing_tiers, i.status, i.last_reviewed_at,
                  i.coverage_notes, c.name AS category_name
             FROM catalog_items i
             JOIN categories c ON c.id = i.category_id
            ORDER BY c.name, i.name`
        ),
        pool.query(
          `SELECT cc.category_id, bu.name AS business_unit, cc.coverage_level
             FROM catalog_category_coverage cc
             JOIN catalog_business_units bu ON bu.id = cc.business_unit_id`
        ),
        pool.query(
          `SELECT f.id, f.category_id, f.supplier, f.feed_name, f.format, f.status,
                  f.last_imported_at, f.next_refresh_due, f.pending_changes, f.requires_finance_review,
                  f.change_log_url, c.name AS category_name
             FROM catalog_vendor_feeds f
             LEFT JOIN categories c ON c.id = f.category_id
            ORDER BY f.feed_name`
        ),
        pool.query(
          `SELECT pc.id, pc.category_id, pc.supplier, pc.status, pc.sso_status, pc.cart_success_rate,
                  pc.last_transaction_at, pc.coverage_scope, pc.notes, c.name AS category_name
             FROM punchout_connections pc
             LEFT JOIN categories c ON c.id = pc.category_id
            ORDER BY pc.supplier`
        ),
      ]);

    const categories = categoryRes.rows.map((row) => ({
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      parentName: row.parent_name || null,
      monthlyBudget: Number(row.monthly_budget) || 0,
      contractNumber: row.contract_number,
      preferredSuppliers: normalizeTextArray(row.preferred_suppliers),
      coverageScore: row.coverage_score !== null ? Number(row.coverage_score) : 0,
      lastReviewedAt: row.last_reviewed_at,
    }));

    const items = itemRes.rows.map((row) => ({
      id: row.id,
      categoryId: row.category_id,
      categoryName: row.category_name,
      name: row.name,
      sku: row.sku,
      unitOfMeasure: row.unit_of_measure,
      basePrice: Number(row.base_price),
      currency: row.currency,
      preferredSupplier: row.preferred_supplier,
      contractNumber: row.contract_number,
      pricingTiers: row.pricing_tiers || {},
      status: row.status,
      lastReviewedAt: row.last_reviewed_at,
      coverageNotes: row.coverage_notes,
    }));

    const coverageRows = coverageRes.rows.map((row) => ({
      categoryId: row.category_id,
      businessUnit: row.business_unit,
      coverageLevel: row.coverage_level,
    }));

    const vendorFeeds = feedRes.rows.map((row) => ({
      id: row.id,
      categoryId: row.category_id,
      categoryName: row.category_name,
      supplier: row.supplier,
      feedName: row.feed_name,
      format: row.format,
      status: row.status,
      lastImportedAt: row.last_imported_at,
      nextRefreshDue: row.next_refresh_due,
      pendingChanges: Number(row.pending_changes) || 0,
      requiresFinanceReview: Boolean(row.requires_finance_review),
      changeLogUrl: row.change_log_url,
    }));

    const punchoutConnections = punchoutRes.rows.map((row) => ({
      id: row.id,
      categoryId: row.category_id,
      categoryName: row.category_name,
      supplier: row.supplier,
      status: row.status,
      ssoStatus: row.sso_status,
      cartSuccessRate:
        row.cart_success_rate === null ? null : Number(row.cart_success_rate),
      lastTransactionAt: row.last_transaction_at,
      coverageScope: row.coverage_scope,
      notes: row.notes,
    }));

    const itemsByCategory = new Map();
    for (const item of items) {
      if (!itemsByCategory.has(item.categoryId))
        itemsByCategory.set(item.categoryId, []);
      itemsByCategory.get(item.categoryId).push(item);
    }

    const coverageByCategory = new Map();
    for (const row of coverageRows) {
      if (!coverageByCategory.has(row.categoryId))
        coverageByCategory.set(row.categoryId, []);
      coverageByCategory.get(row.categoryId).push({
        businessUnit: row.businessUnit,
        level: row.coverageLevel,
      });
    }

    const feedsByCategory = new Map();
    for (const feed of vendorFeeds) {
      if (!feedsByCategory.has(feed.categoryId))
        feedsByCategory.set(feed.categoryId, []);
      feedsByCategory.get(feed.categoryId).push(feed);
    }

    const punchoutByCategory = new Map();
    for (const conn of punchoutConnections) {
      if (!punchoutByCategory.has(conn.categoryId))
        punchoutByCategory.set(conn.categoryId, []);
      punchoutByCategory.get(conn.categoryId).push(conn);
    }

    const categoriesEnriched = categories.map((category) => {
      const itemsForCategory = itemsByCategory.get(category.id) || [];
      const coverage = coverageByCategory.get(category.id) || [];
      const feeds = feedsByCategory.get(category.id) || [];
      const connectors = punchoutByCategory.get(category.id) || [];

      const unitsOfMeasure = Array.from(
        new Set(itemsForCategory.map((item) => item.unitOfMeasure))
      ).sort();

      const pricingTierCount = itemsForCategory.reduce((sum, item) => {
        const tiers =
          item.pricingTiers && typeof item.pricingTiers === 'object'
            ? Object.keys(item.pricingTiers).length
            : 0;
        return sum + tiers;
      }, 0);

      const pendingChanges = feeds.reduce(
        (sum, feed) => sum + (Number(feed.pendingChanges) || 0),
        0
      );

      const requiresFinanceReview = feeds.some(
        (feed) => feed.requiresFinanceReview && feed.pendingChanges > 0
      );

      const lastUpdatedAt = latestDate([
        category.lastReviewedAt,
        ...itemsForCategory.map((item) => item.lastReviewedAt),
        ...feeds.map((feed) => feed.lastImportedAt),
        ...connectors.map((conn) => conn.lastTransactionAt),
      ]);

      const punchoutStatus = connectors.length
        ? {
            total: connectors.length,
            healthy: connectors.filter(
              (conn) =>
                conn.status === 'active' && conn.ssoStatus === 'healthy'
            ).length,
            issues: connectors.filter(
              (conn) =>
                conn.status !== 'active' || conn.ssoStatus !== 'healthy'
            ).length,
          }
        : null;

      return {
        id: category.id,
        name: category.name,
        parentId: category.parentId,
        parentName: category.parentName,
        path: category.parentName
          ? [category.parentName, category.name]
          : [category.name],
        monthlyBudget: category.monthlyBudget,
        contractNumber: category.contractNumber,
        preferredSuppliers: category.preferredSuppliers,
        coverageScore: category.coverageScore,
        lastReviewedAt: category.lastReviewedAt,
        lastUpdatedAt,
        itemCount: itemsForCategory.length,
        activeItemCount: itemsForCategory.filter((item) => item.status === 'active')
          .length,
        unitsOfMeasure,
        pricingTierCount,
        pendingChanges,
        requiresFinanceReview,
        coverage,
        feedCount: feeds.length,
        punchoutStatus,
      };
    });

    const feedsRequiringReview = vendorFeeds.filter(
      (feed) => feed.requiresFinanceReview && feed.pendingChanges > 0
    ).length;

    const punchoutSuccess = punchoutConnections
      .map((conn) =>
        conn.cartSuccessRate === null ? null : Number(conn.cartSuccessRate)
      )
      .filter((value) => Number.isFinite(value));
    const punchoutHealthAvg = average(punchoutSuccess);
    const punchoutHealth =
      punchoutHealthAvg === null
        ? null
        : Math.round(punchoutHealthAvg * 10) / 10;

    const staleCategories = categoriesEnriched.filter((cat) =>
      isOlderThan(cat.lastReviewedAt, 45)
    ).length;
    const staleItems = items.filter((item) =>
      isOlderThan(item.lastReviewedAt, 45)
    ).length;

    const summary = {
      activeCategories: categoriesEnriched.length,
      totalItems: items.length,
      feedsRequiringReview,
      punchoutConnections: punchoutConnections.length,
      punchoutHealth,
      staleRecords: {
        categories: staleCategories,
        items: staleItems,
      },
    };

    const businessUnitStats = new Map();
    for (const row of coverageRows) {
      const key = row.businessUnit;
      const entry =
        businessUnitStats.get(key) ||
        { businessUnit: key, full: 0, partial: 0, none: 0, total: 0 };
      if (row.coverageLevel === 'full') entry.full += 1;
      else if (row.coverageLevel === 'partial') entry.partial += 1;
      else entry.none += 1;
      entry.total += 1;
      businessUnitStats.set(key, entry);
    }

    const businessUnitCoverage = Array.from(businessUnitStats.values()).map(
      (entry) => ({
        ...entry,
        fullPercent: entry.total
          ? Math.round((entry.full / entry.total) * 100)
          : 0,
        gaps: entry.partial + entry.none,
      })
    );

    const cadenceValues = vendorFeeds
      .map((feed) => {
        const last = parseDateValue(feed.lastImportedAt);
        const next = parseDateValue(feed.nextRefreshDue);
        if (!last || !next) return null;
        const diff =
          (next.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
        return Number.isFinite(diff) && diff > 0 ? diff : null;
      })
      .filter((value) => value !== null);
    const reviewCadence = average(cadenceValues);
    const reviewCadenceDays =
      reviewCadence === null ? null : Math.round(reviewCadence * 10) / 10;

    const priceVarianceAlerts = items.filter(
      (item) =>
        typeof item.coverageNotes === 'string' &&
        item.coverageNotes.toLowerCase().includes('variance')
    ).length;

    const connectorsNeedingAttention = punchoutConnections.filter(
      (conn) => conn.status !== 'active' || conn.ssoStatus !== 'healthy'
    ).length;

    const coverageScoreAverage =
      categoriesEnriched.length === 0
        ? null
        : Math.round(
            (categoriesEnriched.reduce(
              (sum, cat) => sum + Number(cat.coverageScore || 0),
              0
            ) /
              categoriesEnriched.length) *
              10
          ) / 10;

    const analytics = {
      businessUnitCoverage,
      coverageScoreAverage,
      reviewCadenceDays,
      priceVarianceAlerts,
      financeReviewQueue: feedsRequiringReview,
      staleContent: {
        categories: staleCategories,
        items: staleItems,
      },
      connectorsNeedingAttention,
      integrationExports: {
        automatedFeeds: vendorFeeds.filter((feed) =>
          ['published', 'scheduled'].includes(feed.status)
        ).length,
        punchout: punchoutConnections.length,
      },
      unitsWithGaps: businessUnitCoverage.filter((entry) => entry.gaps > 0).length,
    };

    res.json({
      summary,
      categories: categoriesEnriched,
      items,
      vendorFeeds,
      punchoutConnections,
      analytics,
    });
  } catch (error) {
    console.error('catalogue.overview.error', error);
    res.status(500).json({ error: 'failed to load catalogue overview' });
  }
});

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

async function syncOrderRequestLink(nextOrder, previousOrder = null) {
  try {
    const prevHasLink =
      previousOrder &&
      Object.prototype.hasOwnProperty.call(previousOrder, 'request_id') &&
      previousOrder.request_id !== null;
    const prevHasPoNumber =
      prevHasLink &&
      Object.prototype.hasOwnProperty.call(previousOrder, 'po_number') &&
      previousOrder.po_number !== null;
    const shouldClear =
      prevHasPoNumber &&
      (!nextOrder ||
        !Object.prototype.hasOwnProperty.call(nextOrder, 'request_id') ||
        nextOrder.request_id !== previousOrder.request_id ||
        nextOrder.po_number !== previousOrder.po_number);

    if (shouldClear) {
      const params = [previousOrder.request_id, previousOrder.po_number];
      await pool
        .query(
          'UPDATE requests SET po_number=NULL WHERE id=$1 AND po_number=$2',
          params
        )
        .catch(() => {});
    }

    if (
      nextOrder &&
      Object.prototype.hasOwnProperty.call(nextOrder, 'request_id') &&
      nextOrder.request_id !== null
    ) {
      const sets = [];
      const values = [];
      let index = 1;

      if (Object.prototype.hasOwnProperty.call(nextOrder, 'po_number')) {
        sets.push(`po_number=$${index}`);
        values.push(nextOrder.po_number || null);
        index += 1;
      }
      if (Object.prototype.hasOwnProperty.call(nextOrder, 'vendor_id')) {
        sets.push(`vendor_id=$${index}`);
        values.push(nextOrder.vendor_id || null);
        index += 1;
      }

      if (sets.length) {
        values.push(nextOrder.request_id);
        await pool
          .query(`UPDATE requests SET ${sets.join(', ')} WHERE id=$${index}`, values)
          .catch(() => {});
      }
    }
  } catch (error) {
    console.warn('order-request sync failed', error);
  }
}

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
  roleRequired('admin', 'approver', 'buyer', 'finance'),
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

      if (!created) {
        return res.status(500).json({ error: 'failed to create order' });
      }

      await syncOrderRequestLink(created);

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
  roleRequired('admin', 'approver', 'buyer', 'finance'),
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
      const existing = await Orders.findById(orderId);
      if (!existing) return res.status(404).json({ error: 'order not found' });

      const updated = await Orders.update(orderId, updates);
      if (!updated) return res.status(404).json({ error: 'order not found' });
      await syncOrderRequestLink(updated, existing);
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
  roleRequired('admin', 'approver', 'buyer', 'finance'),
  async (req, res) => {
    const orderId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(orderId)) {
      return res.status(400).json({ error: 'invalid order id' });
    }
    try {
      const existing = await Orders.findById(orderId);
      if (!existing) return res.status(404).json({ error: 'order not found' });

      const removed = await Orders.remove(orderId);
      if (!removed) return res.status(404).json({ error: 'order not found' });
      await syncOrderRequestLink(null, existing);
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
