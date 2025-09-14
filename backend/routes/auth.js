import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const ROLES = {
  REQUESTER: 'requester',
  APPROVER: 'approver',
  PROCUREMENT_OFFICER: 'procurement_officer',
  ADMINISTRATOR: 'administrator',
};

const users = [];

export const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role || !Object.values(ROLES).includes(role)) {
    return res.status(400).json({ message: 'Invalid registration data' });
  }

  const existing = users.find((u) => u.username === username);
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash, role });
  res.status(201).json({ message: 'User registered' });
});

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

