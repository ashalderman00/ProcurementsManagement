import jwt from 'jsonwebtoken';

// Middleware to authenticate requests using JWT
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch {
    res.sendStatus(403);
  }
}

// Middleware factory to authorize based on user roles
export function authorizeRoles(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
}

