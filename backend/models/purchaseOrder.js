import pool from '../db.js';

export async function createPurchaseOrder({ requestId, orderNumber, vendor, totalAmount }) {
  const result = await pool.query(
    `INSERT INTO purchase_orders (request_id, order_number, vendor, total_amount)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [requestId, orderNumber, vendor, totalAmount],
  );
  return result.rows[0];
}

export async function findPurchaseOrderById(id) {
  const result = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getAllPurchaseOrders() {
  const result = await pool.query('SELECT * FROM purchase_orders');
  return result.rows;
}

export async function updatePurchaseOrder(id, { requestId, orderNumber, vendor, totalAmount }) {
  const result = await pool.query(
    `UPDATE purchase_orders
     SET request_id = COALESCE($1, request_id),
         order_number = COALESCE($2, order_number),
         vendor = COALESCE($3, vendor),
         total_amount = COALESCE($4, total_amount)
     WHERE id = $5
     RETURNING *`,
    [requestId, orderNumber, vendor, totalAmount, id],
  );
  return result.rows[0];
}

export async function deletePurchaseOrder(id) {
  const result = await pool.query('DELETE FROM purchase_orders WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}
