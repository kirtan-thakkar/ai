const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config');

// FAI Viva diagnostics and algorithm inspector
router.get('/diagnostics', async (req, res) => {
  try {
    const aiRes = await axios.get(`${config.AI_SERVICE_URL}/viva/diagnostics`);
    return res.json(aiRes.data);
  } catch (err) {
    return res.status(502).json({ error: 'AI service diagnostics unavailable.' });
  }
});

// Explore Frame representation
router.get('/frames/:frameId', async (req, res) => {
  try {
    const aiRes = await axios.get(`${config.AI_SERVICE_URL}/frames/explore/${req.params.frameId}`);
    return res.json(aiRes.data);
  } catch (err) {
    return res.status(502).json({ error: 'Frame inspector unavailable.' });
  }
});

// Explore Knowledge Graph path
router.get('/graph/path/:movieA/:movieB', async (req, res) => {
  try {
    const aiRes = await axios.get(`${config.AI_SERVICE_URL}/knowledge-graph/path/${req.params.movieA}/${req.params.movieB}`);
    return res.json(aiRes.data);
  } catch (err) {
    return res.status(502).json({ error: 'Graph path unavailable.' });
  }
});

module.exports = router;
