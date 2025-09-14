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
