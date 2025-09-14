const db = require('../db');

const create = async ({ requestId, approverId, status, comment }) =>
  db.query(
    'INSERT INTO approvals (request_id, approver_id, status, comment) VALUES ($1, $2, $3, $4) RETURNING *',
    [requestId, approverId, status, comment]
  );

const findAll = async () => db.query('SELECT * FROM approvals');

module.exports = {
  create,
  findAll,
};
