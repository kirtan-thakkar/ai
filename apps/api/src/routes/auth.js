const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const storage = require('../storage');
const authMiddleware = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = storage.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `usr_${uuidv4().replace(/-/g, '').slice(0, 12)}`,
      name,
      email: email.toLowerCase(),
      password_hash,
      email_verified_at: new Date().toISOString(),
      status: 'active',
      created_at: new Date().toISOString()
    };

    storage.createUser(newUser);
    storage.logAudit(newUser.id, 'USER_REGISTERED', { email: newUser.email });

    const token = jwt.sign({ userId: newUser.id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

    const { password_hash: _, ...safeUser } = newUser;
    return res.status(201).json({
      user: safeUser,
      token,
      message: 'Account created successfully.'
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = storage.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
    storage.logAudit(user.id, 'USER_LOGIN', { email: user.email });

    const { password_hash: _, ...safeUser } = user;
    return res.json({
      user: safeUser,
      token,
      message: 'Logged in successfully.'
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// Current User Profile
router.get('/users/me', authMiddleware, (req, res) => {
  const { password_hash: _, ...safeUser } = req.user;
  const interests = storage.getUserInterests(req.user.id);
  const beliefs = storage.getUserBeliefs(req.user.id);
  return res.json({
    user: safeUser,
    interests,
    beliefs
  });
});

// Update Profile
router.patch('/users/me', authMiddleware, (req, res) => {
  const { name } = req.body;
  const updated = storage.updateUser(req.user.id, { name });
  const { password_hash: _, ...safeUser } = updated;
  return res.json({ user: safeUser });
});

module.exports = router;
