const db = require('../db');

const create = async ({ requestId, vendor, total }) =>
  db.query(
    'INSERT INTO purchase_orders (request_id, vendor, total) VALUES ($1, $2, $3) RETURNING *',
    [requestId, vendor, total]
  );

const findAll = async () => db.query('SELECT * FROM purchase_orders');

module.exports = {
  create,
  findAll,
};
