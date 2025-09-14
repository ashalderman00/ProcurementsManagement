import pool from '../db.js';

export async function createApproval({ requestId, approverId, status, comments }) {
  const result = await pool.query(
    `INSERT INTO approvals (request_id, approver_id, status, comments)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [requestId, approverId, status, comments],
  );
  return result.rows[0];
}

export async function findApprovalById(id) {
  const result = await pool.query('SELECT * FROM approvals WHERE id = $1', [id]);
  return result.rows[0];
}
