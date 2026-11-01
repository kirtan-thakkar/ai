const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config');

// F-04 AI Assistant Goal Parser
router.post('/parse-goal', async (req, res) => {
  try {
    const aiRes = await axios.post(`${config.AI_SERVICE_URL}/assistant/parse-goal`, req.body);
    return res.json(aiRes.data);
  } catch (err) {
    console.error('Goal parse error:', err.message);
    return res.status(502).json({ error: 'Failed to parse natural language goal.' });
  }
});

module.exports = router;
