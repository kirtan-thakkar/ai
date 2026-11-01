const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config');

// Live Free Movie API Search
router.get('/live', async (req, res) => {
  try {
    const aiRes = await axios.get(`${config.AI_SERVICE_URL}/movies/live`, { params: req.query });
    return res.json(aiRes.data);
  } catch (err) {
    console.error('Live movies error:', err.message);
    return res.status(502).json({ error: 'Failed to fetch from live movie API.' });
  }
});

// List movies
router.get('/', async (req, res) => {
  try {
    const aiRes = await axios.get(`${config.AI_SERVICE_URL}/movies`, { params: req.query });
    return res.json(aiRes.data);
  } catch (err) {
    console.error('Movies catalogue error:', err.message);
    return res.status(502).json({ error: 'Failed to fetch movies catalogue.' });
  }
});

// Single movie detail (with frames & knowledge graph)
router.get('/:id', async (req, res) => {
  try {
    const aiRes = await axios.get(`${config.AI_SERVICE_URL}/movies/${req.params.id}`);
    return res.json(aiRes.data);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Movie not found.' });
    }
    return res.status(502).json({ error: 'Failed to fetch movie details.' });
  }
});

// Alternatives finder (k-NN)
router.get('/:id/alternatives', async (req, res) => {
  try {
    const aiRes = await axios.get(`${config.AI_SERVICE_URL}/movies/${req.params.id}/alternatives`, {
      params: req.query
    });
    return res.json(aiRes.data);
  } catch (err) {
    console.error('Alternatives error:', err.message);
    return res.status(502).json({ error: 'Failed to fetch movie alternatives.' });
  }
});

module.exports = router;
