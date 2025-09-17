require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pickRule, materializeStages, recomputeRequestStatus } = require('./workflow');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const conn = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/procurement_db';
const needsSSL = /render\.com|sslmode=require/i.test(conn);
const pool = new Pool({ connectionString: conn, ssl: needsSSL ? { rejectUnauthorized: false } : false });

app.use((req, _res, next) => { console.log(`[API] ${req.method} ${req.url}`); next(); });

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));
const upload = multer({ dest: UPLOAD_DIR });

// ===== auth helpers =====
function signToken(user) { return jwt.sign({ id:user.id, email:user.email, role:user.role }, JWT_SECRET, { expiresIn:'7d' }); }
function authRequired(req, res, next) {
  const h = req.headers.authorization || ''; const token = h.startsWith('Bearer ')? h.slice(7): null;
  if (!token) return res.status(401).json({ error:'missing token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch { return res.status(401).json({ error:'invalid token' }); }
}
function roleRequired(...roles){
  return (req,res,next)=> (req.user && roles.includes(req.user.role)) ? next() : res.status(403).json({ error:'forbidden' });
}

// ===== auth routes =====
app.post('/api/auth/signup', async (req,res)=>{
  try{
    const { email, password, role } = req.body||{};
    if(!email||!password) return res.status(400).json({ error:'email and password required' });
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query('INSERT INTO users(email,password_hash,role) VALUES($1,$2,$3) RETURNING id,email,role',
      [String(email).toLowerCase(), hash, role && ['requester','approver','admin'].includes(role)? role: 'requester']);
    const user=r.rows[0]; const token=signToken(user);
    res.status(201).json({ token, user });
  }catch(e){ if(String(e.message).includes('duplicate')) return res.status(409).json({ error:'email taken' }); res.status(500).json({ error:'signup failed' }); }
});
app.post('/api/auth/login', async (req,res)=>{
  try{
    const { email,password }=req.body||{};
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [String(email).toLowerCase()]);
    if(!r.rows.length) return res.status(401).json({ error:'invalid credentials' });
    const u=r.rows[0]; const ok=await bcrypt.compare(password||'', u.password_hash);
    if(!ok) return res.status(401).json({ error:'invalid credentials' });
    res.json({ token:signToken(u), user:{ id:u.id, email:u.email, role:u.role }});
  }catch(e){ res.status(500).json({ error:'login failed' }); }
});
app.get('/api/me', authRequired, (req,res)=> res.json({ user:{ id:req.user.id, email:req.user.email, role:req.user.role }}));

// ===== health =====
app.get('/api/health', async (_req,res)=>{
  try{ const r=await pool.query('SELECT 1 as ok'); res.json({ api:'ok', db:r.rows[0].ok===1?'ok':'unknown' }); }
  catch(e){ res.status(500).json({ api:'ok', db:'error', error:e.message||'' }); }
});

// ===== vendors =====
app.get('/api/vendors', async (_req,res)=>{ const { rows }=await pool.query('SELECT * FROM vendors ORDER BY name'); res.json(rows); });
app.post('/api/vendors', authRequired, roleRequired('admin'), async (req,res)=>{
  const { name, risk='low', status='active', website, notes } = req.body || {};
  if(!name) return res.status(400).json({ error:'name required' });
  const { rows } = await pool.query(
    'INSERT INTO vendors(name,risk,status,website,notes) VALUES($1,$2,$3,$4,$5) RETURNING *',
    [name.trim(), risk, status, website||null, notes||null]
  );
  res.status(201).json(rows[0]);
});

// ===== categories (kept) =====
app.get('/api/categories', async (_req,res)=>{ const { rows }=await pool.query('SELECT id,name,monthly_budget FROM categories ORDER BY name'); res.json(rows); });
app.post('/api/categories', authRequired, roleRequired('admin','approver'), async (req,res)=>{
  const { name, monthly_budget=0 } = req.body||{};
  if(!name) return res.status(400).json({ error:'name required' });
  const budget=Number(monthly_budget)||0;
  const { rows }=await pool.query('INSERT INTO categories(name,monthly_budget) VALUES($1,$2) RETURNING *', [name.trim(), budget]);
  res.status(201).json(rows[0]);
});

// ===== approval rules (policy data) =====
app.get('/api/approval-rules', authRequired, roleRequired('admin'), async (_req,res)=>{
  const { rows }=await pool.query('SELECT * FROM approval_rules WHERE active=true ORDER BY min_amount');
  res.json(rows);
});
app.post('/api/approval-rules', authRequired, roleRequired('admin'), async (req,res)=>{
  const { name, min_amount=0, max_amount=null, category_id=null, vendor_id=null, stages=[] } = req.body||{};
  if(!name || !Array.isArray(stages) || stages.length===0) return res.status(400).json({ error:'name & stages required' });
  const { rows }=await pool.query(
    'INSERT INTO approval_rules(name,min_amount,max_amount,category_id,vendor_id,stages,active) VALUES($1,$2,$3,$4,$5,$6,true) RETURNING *',
    [name, Number(min_amount)||0, max_amount===null? null: Number(max_amount), category_id, vendor_id, JSON.stringify(stages)]
  );
  res.status(201).json(rows[0]);
});

// ===== requests with vendor, policy-driven stages =====
app.get('/api/requests', async (_req,res)=>{
  const { rows }=await pool.query(
    `SELECT r.id,r.title,r.amount,r.status,r.created_at,r.category_id,c.name AS category_name,
            r.vendor_id,v.name AS vendor_name, r.po_number
       FROM requests r
       LEFT JOIN categories c ON c.id=r.category_id
       LEFT JOIN vendors v ON v.id=r.vendor_id
     ORDER BY r.created_at DESC`
  );
  res.json(rows);
});

app.get('/api/requests/:id/approvals', authRequired, async (req,res)=>{
  const { rows }=await pool.query('SELECT * FROM request_approvals WHERE request_id=$1 ORDER BY stage_index', [Number(req.params.id)]);
  res.json(rows);
});

app.post('/api/requests', authRequired, async (req,res)=>{
  const client = await pool.connect();
  try{
    const { title, amount, category_id, vendor_id, po_number } = req.body||{};
    if(!title) return res.status(400).json({ error:'title required' });
    const amt = Number(amount); if(Number.isNaN(amt)||amt<0) return res.status(400).json({ error:'invalid amount' });

    await client.query('BEGIN');
    const ins = await client.query(
      `INSERT INTO requests(title,amount,category_id,requester_id,vendor_id,po_number)
       VALUES($1,$2,$3,$4,$5,$6)
       RETURNING id,title,amount,status,created_at,category_id,vendor_id,po_number`,
      [title.trim(), amt, category_id||null, req.user.id, vendor_id||null, po_number||null]
    );
    const reqRow = ins.rows[0];

    const rulesQ = await client.query('SELECT * FROM approval_rules WHERE active=true ORDER BY min_amount');
    const rule = pickRule({ amount: amt, category_id: category_id||null, vendor_id: vendor_id||null, rules: rulesQ.rows });
    const stages = rule ? JSON.parse(rule.stages) : ['approver']; // fallback single approver

    await materializeStages(client, reqRow.id, stages);
    await client.query(
      'INSERT INTO audit_log(object_type, object_id, action, actor_id, meta) VALUES($1,$2,$3,$4,$5)',
      ['request', reqRow.id, 'create', req.user.id, JSON.stringify({ amount: amt, category_id, vendor_id, po_number })]
    );
    await client.query('COMMIT');
    res.status(201).json(reqRow);
  }catch(e){
    await client.query('ROLLBACK');
    console.error('create request error:', e.message);
    res.status(500).json({ error:'failed to create' });
  }finally{ client.release(); }
});

// stage approve/deny (enforce role per stage)
app.post('/api/requests/:id/approve', authRequired, async (req,res)=>{
  const client = await pool.connect();
  try{
    const request_id = Number(req.params.id);
    await client.query('BEGIN');
    const { rows: stages }=await client.query('SELECT * FROM request_approvals WHERE request_id=$1 ORDER BY stage_index FOR UPDATE', [request_id]);
    const open = stages.find(s => s.status==='pending');
    if(!open) return res.status(400).json({ error:'no pending stage' });
    if(req.user.role !== open.role_required && req.user.role!=='admin') return res.status(403).json({ error:'wrong role for this stage' });

    await client.query(
      'UPDATE request_approvals SET status=$1, acted_by=$2, acted_at=NOW() WHERE id=$3',
      ['approved', req.user.id, open.id]
    );
    await recomputeRequestStatus(client, request_id);
    await client.query(
      'INSERT INTO audit_log(object_type,object_id,action,actor_id,meta) VALUES($1,$2,$3,$4,$5)',
      ['request', request_id, 'approve', req.user.id, JSON.stringify({ stage_index: open.stage_index })]
    );
    await client.query('COMMIT');
    res.json({ ok:true });
  }catch(e){ await client.query('ROLLBACK'); res.status(500).json({ error:'approve failed' }); }
  finally{ client.release(); }
});

app.post('/api/requests/:id/deny', authRequired, async (req,res)=>{
  const client = await pool.connect();
  try{
    const request_id = Number(req.params.id);
    await client.query('BEGIN');
    const { rows: stages }=await client.query('SELECT * FROM request_approvals WHERE request_id=$1 ORDER BY stage_index FOR UPDATE', [request_id]);
    const open = stages.find(s => s.status==='pending');
    if(!open) return res.status(400).json({ error:'no pending stage' });
    if(req.user.role !== open.role_required && req.user.role!=='admin') return res.status(403).json({ error:'wrong role for this stage' });

    await client.query(
      'UPDATE request_approvals SET status=$1, acted_by=$2, acted_at=NOW() WHERE id=$3',
      ['denied', req.user.id, open.id]
    );
    await recomputeRequestStatus(client, request_id);
    await client.query(
      'INSERT INTO audit_log(object_type,object_id,action,actor_id,meta) VALUES($1,$2,$3,$4,$5)',
      ['request', request_id, 'deny', req.user.id, JSON.stringify({ stage_index: open.stage_index })]
    );
    await client.query('COMMIT');
    res.json({ ok:true });
  }catch(e){ await client.query('ROLLBACK'); res.status(500).json({ error:'deny failed' }); }
  finally{ client.release(); }
});

// files (keep)
app.post('/api/requests/:id/files', authRequired, upload.single('file'), async (req,res)=>{
  try{
    const id = Number(req.params.id);
    if(!req.file) return res.status(400).json({ error:'file required' });
    const url = `/uploads/${req.file.filename}`;
    const r = await pool.query('INSERT INTO request_files(request_id,filename,url) VALUES($1,$2,$3) RETURNING *',
      [id, req.file.originalname, url]);
    res.status(201).json(r.rows[0]);
  }catch(e){ res.status(500).json({ error:'upload failed' }); }
});
app.get('/api/requests/:id/files', authRequired, async (req,res)=>{
  const id = Number(req.params.id);
  const { rows }=await pool.query('SELECT id,filename,url,created_at FROM request_files WHERE request_id=$1 ORDER BY created_at DESC', [id]);
  res.json(rows);
});

app.listen(PORT, ()=> console.log(`Backend listening on http://localhost:${PORT}`));
