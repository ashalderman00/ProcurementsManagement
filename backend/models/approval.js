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

export async function getAllApprovals() {
  const result = await pool.query('SELECT * FROM approvals');
  return result.rows;
}

export async function updateApproval(id, { requestId, approverId, status, comments, approvedAt }) {
  const result = await pool.query(
    `UPDATE approvals
     SET request_id = COALESCE($1, request_id),
         approver_id = COALESCE($2, approver_id),
         status = COALESCE($3, status),
         comments = COALESCE($4, comments),
         approved_at = COALESCE($5, approved_at)
     WHERE id = $6
     RETURNING *`,
    [requestId, approverId, status, comments, approvedAt, id],
  );
  return result.rows[0];
}

export async function deleteApproval(id) {
  const result = await pool.query('DELETE FROM approvals WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}
