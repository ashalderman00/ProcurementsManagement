const db = require('../db');

const create = async ({ name, email }) =>
  db.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [
    name,
    email,
  ]);

const findAll = async () => db.query('SELECT * FROM users');

module.exports = {
  create,
  findAll,
};
