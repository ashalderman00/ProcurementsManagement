const { pool } = require('../db');

const ORDER_STATUSES = ['draft', 'issued', 'receiving', 'received', 'cancelled'];
const ORDER_SELECT = `
  o.id,
  o.po_number,
  o.status,
  o.total,
  o.vendor,
  o.vendor_id,
  o.request_id,
  o.expected_date,
  o.notes,
  o.created_at,
  o.updated_at,
  v.name AS vendor_name,
  r.title AS request_title
`;

async function getAll() {
  const { rows } = await pool.query(
    `SELECT ${ORDER_SELECT}
       FROM purchase_orders o
       LEFT JOIN vendors v ON v.id = o.vendor_id
       LEFT JOIN requests r ON r.id = o.request_id
     ORDER BY o.created_at DESC`
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${ORDER_SELECT}
       FROM purchase_orders o
       LEFT JOIN vendors v ON v.id = o.vendor_id
       LEFT JOIN requests r ON r.id = o.request_id
      WHERE o.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({
  po_number = null,
  vendor_name,
  vendor_id = null,
  total,
  status,
  request_id = null,
  expected_date = null,
  notes = null,
}) {
  const { rows } = await pool.query(
    `INSERT INTO purchase_orders (po_number, vendor, vendor_id, total, status, request_id, expected_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [po_number || null, vendor_name, vendor_id, total, status, request_id, expected_date, notes]
  );
  return rows[0] ? findById(rows[0].id) : null;
}

async function update(id, updates = {}) {
  const fields = [];
  const values = [];
  let index = 1;

  if (Object.prototype.hasOwnProperty.call(updates, 'po_number')) {
    fields.push(`po_number = $${index}`);
    values.push(updates.po_number || null);
    index += 1;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'vendor_name')) {
    fields.push(`vendor = $${index}`);
    values.push(updates.vendor_name);
    index += 1;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'vendor_id')) {
    fields.push(`vendor_id = $${index}`);
    values.push(updates.vendor_id);
    index += 1;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'total')) {
    fields.push(`total = $${index}`);
    values.push(updates.total);
    index += 1;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'status')) {
    fields.push(`status = $${index}`);
    values.push(updates.status);
    index += 1;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'request_id')) {
    fields.push(`request_id = $${index}`);
    values.push(updates.request_id);
    index += 1;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'expected_date')) {
    fields.push(`expected_date = $${index}`);
    values.push(updates.expected_date);
    index += 1;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'notes')) {
    fields.push(`notes = $${index}`);
    values.push(updates.notes);
    index += 1;
  }

  if (!fields.length) {
    return findById(id);
  }

  fields.push('updated_at = NOW()');

  const { rowCount } = await pool.query(
    `UPDATE purchase_orders
        SET ${fields.join(', ')}
      WHERE id = $${index}`,
    [...values, id]
  );

  if (!rowCount) return null;
  return findById(id);
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM purchase_orders WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = {
  ORDER_STATUSES,
  getAll,
  findById,
  create,
  update,
  remove,
};
