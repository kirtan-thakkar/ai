const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config');
const storage = require('../storage');
const authMiddleware = require('../middleware/auth');

// Run Recommendation Search (A*, Beam Search, or CSP)
router.post('/recommendation-sessions', authMiddleware, async (req, res) => {
  try {
    const {
      mood = 7.0,
      timeBudgetMinutes = 180,
      movieCount = 2,
      genres = [],
      languages = [],
      audience = 'solo',
      excludeTags = [],
      excludeViolence = false,
      strategy = 'astar',
      beamWidth = 3
    } = req.body;

    // Attach user's learned Bayesian genre beliefs
    const userBeliefs = storage.getUserBeliefs(req.user.id);

    const payload = {
      mood: Number(mood),
      time_budget_minutes: Number(timeBudgetMinutes),
      movie_count: Number(movieCount),
      genres,
      languages,
      audience,
      exclude_tags: excludeTags,
      exclude_violence: Boolean(excludeViolence),
      strategy,
      beam_width: Number(beamWidth),
      user_genre_beliefs: userBeliefs
    };

    const aiResponse = await axios.post(`${config.AI_SERVICE_URL}/recommendations/search`, payload);
    const searchData = aiResponse.data;

    // Persist recommendation session and items for review attribution (Section 4 & 5)
    const sessionRecord = {
      id: searchData.sessionId,
      userId: req.user.id,
      mood: Number(mood),
      timeBudget: Number(timeBudgetMinutes),
      movieCount: Number(movieCount),
      strategy,
      genres,
      dominantMood: searchData.dominantMood,
      modelVersion: searchData.modelVersion,
      results: searchData.results,
      searchMetrics: searchData.searchMetrics,
      createdAt: new Date().toISOString()
    };

    storage.saveRecommendationSession(sessionRecord);
    storage.logAudit(req.user.id, 'RECOMMENDATION_SESSION_CREATED', {
      sessionId: sessionRecord.id,
      movieCount: searchData.results.length,
      strategy
    });

    return res.json(sessionRecord);
  } catch (err) {
    console.error('Recommendation session error:', err.message);
    const detail = err.response?.data?.detail || err.message;
    return res.status(502).json({ error: `AI recommendation failed: ${detail}` });
  }
});

// Get session by ID
router.get('/recommendation-sessions/:id', authMiddleware, (req, res) => {
  const session = storage.getRecommendationSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }
  return res.json(session);
});

// Action on recommendation item (Like, Dislike, Save to Watchlist, Skip)
router.post('/recommendation-sessions/:id/actions', authMiddleware, async (req, res) => {
  try {
    const { movieId, action } = req.body; // action: 'like', 'dislike', 'skip', 'save'
    if (!movieId || !action) {
      return res.status(400).json({ error: 'movieId and action are required.' });
    }

    // Record watch event
    storage.recordWatchEvent({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: req.user.id,
      sessionId: req.params.id,
      movieId,
      eventType: action,
      occurredAt: new Date().toISOString()
    });

    // If 'save', add to user default watchlist
    if (action === 'save') {
      const defaultWatchlist = storage.getUserWatchlists(req.user.id)[0];
      if (defaultWatchlist && !defaultWatchlist.movieIds.includes(movieId)) {
        defaultWatchlist.movieIds.push(movieId);
        storage.updateWatchlist(defaultWatchlist.id, { movieIds: defaultWatchlist.movieIds });
      }
    }

    // Trigger Bayesian update asynchronously or synchronously
    if (['like', 'dislike', 'skip', 'save'].includes(action)) {
      const movieRes = await axios.get(`${config.AI_SERVICE_URL}/movies/${movieId}`);
      const movie = movieRes.data?.movie;
      if (movie) {
        const currentBeliefs = storage.getUserBeliefs(req.user.id);
        const updateRes = await axios.post(`${config.AI_SERVICE_URL}/feedback/bayesian-update`, {
          movie_genres: movie.genres || [],
          enjoyment: action === 'dislike' ? 1 : (action === 'like' ? 5 : (action === 'save' ? 4 : 3)),
          recommendation_accuracy: 4,
          mood_match: action === 'dislike' ? 'No' : 'Yes',
          user_beliefs: currentBeliefs
        });
        if (updateRes.data?.updated_user_beliefs) {
          storage.saveUserBeliefs(req.user.id, updateRes.data.updated_user_beliefs);
        }
      }
    }

    return res.json({
      message: `Action '${action}' logged successfully.`,
      movieId,
      action
    });
  } catch (err) {
    console.error('Session action error:', err.message);
    return res.status(500).json({ error: 'Failed to record action.' });
  }
});

// Refine My List (Hill Climbing / Simulated Annealing)
router.post('/recommendations/refine', authMiddleware, async (req, res) => {
  try {
    const aiResponse = await axios.post(`${config.AI_SERVICE_URL}/recommendations/refine`, req.body);
    return res.json(aiResponse.data);
  } catch (err) {
    console.error('Refine error:', err.message);
    return res.status(502).json({ error: 'Failed to refine playlist.' });
  }
});

// Cinematic What-If Counterfactual Reasoning
router.post('/recommendations/what-if', async (req, res) => {
  try {
    const aiResponse = await axios.post(`${config.AI_SERVICE_URL}/recommendations/what-if`, req.body);
    return res.json(aiResponse.data);
  } catch (err) {
    console.error('What-If error:', err.message);
    const detail = err.response?.data?.detail || err.message;
    return res.status(502).json({ error: `What-If analysis failed: ${detail}` });
  }
});

module.exports = router;
