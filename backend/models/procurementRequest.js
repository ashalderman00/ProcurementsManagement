import pool from '../db.js';

export async function createRequest({ userId, itemName, quantity, status = 'pending' }) {
  const result = await pool.query(
    `INSERT INTO procurement_requests (user_id, item_name, quantity, status)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, itemName, quantity, status],
  );
  return result.rows[0];
}

export async function findRequestById(id) {
  const result = await pool.query('SELECT * FROM procurement_requests WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getAllRequests() {
  const result = await pool.query('SELECT * FROM procurement_requests');
  return result.rows;
}

export async function updateRequest(id, { itemName, quantity, status }) {
  const result = await pool.query(
    `UPDATE procurement_requests
     SET item_name = COALESCE($1, item_name),
         quantity = COALESCE($2, quantity),
         status = COALESCE($3, status)
     WHERE id = $4
     RETURNING *`,
    [itemName, quantity, status, id],
  );
  return result.rows[0];
}

export async function deleteRequest(id) {
  const result = await pool.query('DELETE FROM procurement_requests WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}
