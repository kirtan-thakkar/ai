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

// Interactive AI Laboratory Visualizer Demo
router.get('/lab-demo/:algorithm', async (req, res) => {
  try {
    const param = req.query.param ? `?param=${encodeURIComponent(req.query.param)}` : '';
    const aiRes = await axios.get(`${config.AI_SERVICE_URL}/viva/lab-demo/${req.params.algorithm}${param}`);
    return res.json(aiRes.data);
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return res.status(502).json({ error: `Lab demo failed: ${detail}` });
  }
});

// Expert System Choice Explanation Proof
router.post('/explain-choice', async (req, res) => {
  try {
    const aiRes = await axios.post(`${config.AI_SERVICE_URL}/expert-system/explain-choice`, req.body);
    return res.json(aiRes.data);
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return res.status(502).json({ error: `Explain choice failed: ${detail}` });
  }
});

// Cinematic What-If Counterfactual Reasoning
router.post('/what-if', async (req, res) => {
  try {
    const aiRes = await axios.post(`${config.AI_SERVICE_URL}/recommendations/what-if`, req.body);
    return res.json(aiRes.data);
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    return res.status(502).json({ error: `What-If analysis failed: ${detail}` });
  }
});

module.exports = router;
