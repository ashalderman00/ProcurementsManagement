const db = require('../db');

const create = async ({ userId, description, amount, status = 'pending' }) =>
  db.query(
    'INSERT INTO procurement_requests (user_id, description, amount, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, description, amount, status]
  );

const findAll = async () => db.query('SELECT * FROM procurement_requests');

module.exports = {
  create,
  findAll,
};
