// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// LOCK BACKEND PORT HERE
const PORT = process.env.PORT || 4000;

// Postgres connection (local dev default)
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/procurement_db',
});

// tiny request logger for debugging
app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Health route (frontend uses this to confirm API + DB)
app.get('/api/health', async (_req, res) => {
  try {
    const r = await pool.query('SELECT 1 as ok');
    res.json({ api: 'ok', db: r.rows[0].ok === 1 ? 'ok' : 'unknown' });
  } catch (e) {
    res.status(500).json({ api: 'ok', db: 'error', error: e.message });
  }
});

// Example route
app.get('/api/example', (_req, res) => {
  res.json({ message: 'Procurement Management backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
