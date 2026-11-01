const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const storage = require('../storage');
const authMiddleware = require('../middleware/auth');

// Get all watchlists for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const watchlists = storage.getUserWatchlists(req.user.id);
    let movieMap = {};
    try {
      const moviesRes = await axios.get(`${config.AI_SERVICE_URL}/movies?limit=200`, { timeout: 1500 });
      (moviesRes.data?.movies || []).forEach(m => { movieMap[m.id] = m; });
    } catch (e) {
      // AI service might be offline or starting up; proceed with fallback placeholder objects
    }

    const enriched = watchlists.map(w => ({
      ...w,
      movies: (w.movieIds || []).map(mid => movieMap[mid] || { id: mid, title: mid })
    }));

    return res.json({ watchlists: enriched });
  } catch (err) {
    console.error('Watchlist fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch watchlists.' });
  }
});

// Create new custom watchlist
router.post('/', authMiddleware, (req, res) => {
  const { name = 'New Watchlist' } = req.body;
  const newWatchlist = {
    id: `wl_${uuidv4().replace(/-/g, '').slice(0, 10)}`,
    userId: req.user.id,
    name,
    movieIds: [],
    createdAt: new Date().toISOString()
  };
  storage.createWatchlist(newWatchlist);
  return res.status(201).json(newWatchlist);
});

// Add movie to user's default watchlist directly
router.post('/movies', authMiddleware, (req, res) => {
  const { movieId } = req.body;
  if (!movieId) {
    return res.status(400).json({ error: 'movieId is required.' });
  }
  const lists = storage.getUserWatchlists(req.user.id);
  const wl = lists[0];
  if (!wl) {
    return res.status(500).json({ error: 'Failed to access user watchlist.' });
  }

  if (!wl.movieIds.includes(movieId)) {
    wl.movieIds.push(movieId);
    storage.updateWatchlist(wl.id, { movieIds: wl.movieIds });
  }
  return res.json({ message: 'Movie added to watchlist.', movieIds: wl.movieIds, watchlistId: wl.id });
});

// Add movie to specific watchlist
router.post('/:id/movies', authMiddleware, (req, res) => {
  const { movieId } = req.body;
  if (!movieId) {
    return res.status(400).json({ error: 'movieId is required.' });
  }
  const wl = storage.getWatchlist(req.params.id);
  if (!wl || wl.userId !== req.user.id) {
    return res.status(404).json({ error: 'Watchlist not found.' });
  }

  if (!wl.movieIds.includes(movieId)) {
    wl.movieIds.push(movieId);
    storage.updateWatchlist(wl.id, { movieIds: wl.movieIds });
  }
  return res.json({ message: 'Movie added to watchlist.', movieIds: wl.movieIds });
});

// Remove movie from watchlist
router.delete('/:id/movies/:movieId', authMiddleware, (req, res) => {
  const { id, movieId } = req.params;
  const wl = storage.getWatchlist(id);
  if (!wl || wl.userId !== req.user.id) {
    return res.status(404).json({ error: 'Watchlist not found.' });
  }

  const updatedIds = (wl.movieIds || []).filter(mid => mid !== movieId);
  storage.updateWatchlist(wl.id, { movieIds: updatedIds });
  return res.json({ message: 'Movie removed from watchlist.', movieIds: updatedIds });
});

// Smart Watchlist Sequencer (Greedy Best-First / Emotional build-up / Chronology)
router.post('/:id/sequence', authMiddleware, async (req, res) => {
  try {
    const { arc_strategy = 'emotional_buildup' } = req.body;
    const wl = storage.getWatchlist(req.params.id);
    if (!wl || wl.userId !== req.user.id) {
      return res.status(404).json({ error: 'Watchlist not found.' });
    }

    if (!wl.movieIds || wl.movieIds.length === 0) {
      return res.status(400).json({ error: 'Watchlist is empty.' });
    }

    const aiRes = await axios.post(`${config.AI_SERVICE_URL}/recommendations/sequence`, {
      movie_ids: wl.movieIds,
      arc_strategy
    });

    return res.json(aiRes.data);
  } catch (err) {
    console.error('Sequencing error:', err.message);
    return res.status(502).json({ error: 'Failed to sequence watchlist.' });
  }
});

module.exports = router;
