const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'secretkey';

function normalizeRole(role) {
  return String(role || '')
    .trim()
    .toLowerCase();
}

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize =
  (roles = []) =>
  (req, res, next) => {
    const allowed = roles.map(normalizeRole).filter(Boolean);
    const currentRole = normalizeRole(req.user && req.user.role);
    if (allowed.length && !allowed.includes(currentRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };

module.exports = { authenticate, authorize };
