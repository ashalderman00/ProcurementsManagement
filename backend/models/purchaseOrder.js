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
