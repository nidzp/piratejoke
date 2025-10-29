const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  createUser,
  verifyUserCredentials,
  issueJwt,
  getUserById,
} = require('../services/userService');

const router = express.Router();

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    tokens: user.tokens,
    supabaseId: user.supabaseId,
  };
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({
      error: 'Missing required fields',
    });
  }

  try {
    const user = await createUser({
      email: email.trim().toLowerCase(),
      password,
      displayName: name.trim(),
    });

    const token = issueJwt({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    res.status(201).json({
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    if (error.code === 'EMAIL_IN_USE') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Unable to register user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
    });
  }

  try {
    const user = await verifyUserCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = issueJwt({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    res.json({
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Unable to login' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  const user = getUserById(req.user.id);
  res.json({ user: sanitizeUser(user) });
});

module.exports = router;
