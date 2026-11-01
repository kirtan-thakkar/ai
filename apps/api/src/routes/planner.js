const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config');
const storage = require('../storage');
const authMiddleware = require('../middleware/auth');

// Automated Movie Marathon Planner (Goal Stack Planning)
router.post('/marathon', authMiddleware, async (req, res) => {
  try {
    const aiRes = await axios.post(`${config.AI_SERVICE_URL}/planning/marathon`, req.body);
    storage.logAudit(req.user.id, 'MARATHON_PLAN_GENERATED', {
      planId: aiRes.data.plan_id,
      movieCount: aiRes.data.movie_count
    });
    return res.json(aiRes.data);
  } catch (err) {
    console.error('Marathon plan error:', err.message);
    return res.status(502).json({ error: 'Failed to generate marathon plan.' });
  }
});

// Dynamic Reactive Replanning on Drop-off / Skip / Curfew Change
router.post('/replan', authMiddleware, async (req, res) => {
  try {
    const aiRes = await axios.post(`${config.AI_SERVICE_URL}/planning/replan`, req.body);
    storage.logAudit(req.user.id, 'MARATHON_REPLANNED', {
      eventType: req.body.event_type
    });
    return res.json(aiRes.data);
  } catch (err) {
    console.error('Replanning error:', err.message);
    return res.status(502).json({ error: 'Failed to replan schedule.' });
  }
});

module.exports = router;
