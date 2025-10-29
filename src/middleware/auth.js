const jwt = require('jsonwebtoken');
const { getUserById, JWT_SECRET } = require('../services/userService');

function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

function attachUser(req, user) {
  if (user) {
    req.user = user;
  }
}

function authenticateOptional(req, _res, next) {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = getUserById(payload.sub);
    if (user) {
      attachUser(req, user);
    }
  } catch (error) {
    console.warn('Auth token verification failed:', error.message);
  }

  next();
}

function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    attachUser(req, user);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  authenticateOptional,
  requireAuth,
};
