const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const users = [];
const secret = process.env.JWT_SECRET || 'secretkey';

router.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ error: 'username, password and role are required' });
  }

  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  users.push({ id: users.length + 1, username, password: hashed, role });
  return res.status(201).json({ message: 'User registered' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, secret, {
    expiresIn: '1h',
  });
  return res.json({ token });
});

module.exports = router;
