import express from 'express';
import pool from './db.js';

const app = express();
const port = process.env.PORT || 3000;

pool
  .connect()
  .then((client) => {
    client.release();
    console.log('Connected to PostgreSQL');
  })
  .catch((err) => {
    console.error('Failed to connect to PostgreSQL', err);
  });

app.get('/', (req, res) => {
  res.send('Hello World from backend!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
