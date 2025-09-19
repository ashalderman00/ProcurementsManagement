const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const users = [];
const secret = process.env.JWT_SECRET || 'secretkey';

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function normalizeRole(value) {
  const allowed = ['admin', 'approver', 'buyer', 'finance', 'requester'];
  const role = String(value || '')
    .trim()
    .toLowerCase();
  return allowed.includes(role) ? role : 'requester';
}

function responseUser(user) {
  return { id: user.id, email: user.email, role: user.role };
}

function issueToken(user) {
  return jwt.sign(responseUser(user), secret, { expiresIn: '1h' });
}

function handleSignup(req, res) {
  const { email, username, password, role } = req.body || {};
  const identifier = normalizeEmail(email || username);

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ error: 'email and password are required' });
  }

  const existingUser = users.find((u) => u.email === identifier);
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const user = {
    id: users.length + 1,
    email: identifier,
    password: hashed,
    role: normalizeRole(role),
  };
  users.push(user);

  const token = issueToken(user);
  return res.status(201).json({ token, user: responseUser(user) });
}

router.post('/register', handleSignup);
router.post('/signup', handleSignup);

router.post('/login', (req, res) => {
  const { email, username, password } = req.body || {};
  const identifier = normalizeEmail(email || username);

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ error: 'email and password are required' });
  }

  const user = users.find((u) => u.email === identifier);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = issueToken(user);
  return res.json({ token, user: responseUser(user) });
});

module.exports = router;
