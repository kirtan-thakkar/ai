const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config');
const storage = require('../storage');
const authMiddleware = require('../middleware/auth');

// Get interest tree
router.get('/interest-categories', async (req, res) => {
  try {
    const aiRes = await axios.get(`${config.AI_SERVICE_URL}/taxonomies`);
    return res.json(aiRes.data);
  } catch (err) {
    console.error('Error fetching taxonomies from AI service:', err.message);
    return res.status(502).json({ error: 'AI service unavailable.' });
  }
});

// Get user selected interests
router.get('/users/me/interests', authMiddleware, (req, res) => {
  const interests = storage.getUserInterests(req.user.id);
  return res.json({ interests });
});

// Save user selected interests (Onboarding & preferences)
router.put('/users/me/interests', authMiddleware, (req, res) => {
  const { interests } = req.body;
  if (!Array.isArray(interests)) {
    return res.status(400).json({ error: 'Interests must be an array.' });
  }

  storage.saveUserInterests(req.user.id, interests);
  storage.logAudit(req.user.id, 'INTERESTS_SAVED', { count: interests.length });

  return res.json({
    message: 'Interests saved successfully.',
    interests
  });
});

module.exports = router;
