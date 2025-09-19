require('dotenv').config();
const { Pool } = require('pg');

const conn = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/procurement_db';
const needsSSL = /render\.com|sslmode=require/i.test(conn);
const pool = new Pool({ connectionString: conn, ssl: needsSSL ? { rejectUnauthorized:false } : false });

async function run(){
  // categories
  await pool.query(`INSERT INTO categories(name,monthly_budget) VALUES
    ('Laptops',8000),('Software',4000),('Office',1500)
    ON CONFLICT (name) DO NOTHING;`);

  // vendors
  await pool.query(`INSERT INTO vendors(name,risk,status,website) VALUES
    ('Apple','low','active','https://apple.com'),
    ('Adobe','low','active','https://adobe.com'),
    ('Staples','low','active','https://staples.com')
    ON CONFLICT (name) DO NOTHING;`);

  // one admin + one approver + one requester (if you haven’t signed up yet)
  const bcrypt = require('bcryptjs');
  const pass = await bcrypt.hash('demo1234',10);
  await pool.query(`INSERT INTO users(email,password_hash,role) VALUES
    ('admin@demo.co',$1,'admin'),
    ('approver@demo.co',$1,'approver'),
    ('alex@demo.co',$1,'requester')
    ON CONFLICT (email) DO NOTHING;`, [pass]);

  // requests (a mix)
  await pool.query(`
    WITH c AS (SELECT id,name FROM categories),
         v AS (SELECT id,name FROM vendors)
    INSERT INTO requests(title,amount,status,category_id,vendor_id,po_number,requester_id,created_at)
    SELECT * FROM (VALUES
      ('MacBook Pro 14"', 2299.99, 'approved',
        (SELECT id FROM c WHERE name='Laptops'), (SELECT id FROM v WHERE name='Apple'), 'PO-00495',
        (SELECT id FROM users WHERE email='alex@demo.co'), NOW() - INTERVAL '12 days'),

      ('Adobe Creative Cloud', 79.99, 'pending',
        (SELECT id FROM c WHERE name='Software'), (SELECT id FROM v WHERE name='Adobe'), NULL,
        (SELECT id FROM users WHERE email='alex@demo.co'), NOW() - INTERVAL '2 days'),

      ('Office chairs', 960.00, 'denied',
        (SELECT id FROM c WHERE name='Office'), NULL, NULL,
        (SELECT id FROM users WHERE email='alex@demo.co'), NOW() - INTERVAL '6 days'),

      ('Figma Org plan', 480.00, 'approved',
        (SELECT id FROM c WHERE name='Software'), NULL, 'PO-00488',
        (SELECT id FROM users WHERE email='alex@demo.co'), NOW() - INTERVAL '20 days')
    ) AS t(title,amount,status,category_id,vendor_id,po_number,requester_id,created_at)
    ON CONFLICT DO NOTHING;`);

  const vendors = await pool.query('SELECT id,name FROM vendors');
  const vendorByName = new Map(vendors.rows.map((row) => [row.name, row]));
  const requests = await pool.query('SELECT id,title,po_number FROM requests');
  const requestByPo = new Map();
  const requestByTitle = new Map();
  for (const row of requests.rows) {
    if (row.po_number) requestByPo.set(row.po_number, row);
    if (row.title) requestByTitle.set(row.title, row);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  function dateFromOffset(offsetDays = 0) {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }

  const sampleOrders = [
    {
      poNumber: 'PO-00495',
      vendorName: 'Apple',
      requestPo: 'PO-00495',
      total: 2299.99,
      status: 'received',
      expectedOffset: -2,
      notes: 'MacBook delivered and receipted.',
    },
    {
      poNumber: 'PO-00501',
      vendorName: 'Adobe',
      requestTitle: 'Adobe Creative Cloud',
      total: 79.99,
      status: 'issued',
      expectedOffset: 3,
      notes: 'Renewal sent to vendor.',
    },
    {
      poNumber: 'PO-00512',
      vendorName: 'Staples',
      requestTitle: 'Office chairs',
      total: 1020.0,
      status: 'draft',
      expectedOffset: 10,
      notes: 'Waiting for revised shipping quote.',
    },
  ];

  for (const po of sampleOrders) {
    const vendorRow = vendorByName.get(po.vendorName) || null;
    const vendorId = vendorRow ? vendorRow.id : null;
    const vendorName = vendorRow ? vendorRow.name : po.vendorName;

    let requestId = null;
    if (po.requestPo && requestByPo.has(po.requestPo)) {
      requestId = requestByPo.get(po.requestPo).id;
    } else if (po.requestTitle && requestByTitle.has(po.requestTitle)) {
      requestId = requestByTitle.get(po.requestTitle).id;
    }

    await pool.query(
      `INSERT INTO purchase_orders (po_number, vendor, vendor_id, request_id, total, status, expected_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (po_number) DO NOTHING`,
      [
        po.poNumber,
        vendorName,
        vendorId,
        requestId,
        po.total,
        po.status,
        dateFromOffset(po.expectedOffset),
        po.notes,
      ]
    );
  }
  console.log('✅ demo data seeded');
  await pool.end();
}
run().catch(e=>{ console.error(e); process.exit(1); });
