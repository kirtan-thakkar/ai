const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const storage = require('../storage');
const authMiddleware = require('../middleware/auth');

// Submit Post-Watch Review (F-22 Feedback Loop)
// Updates Bayesian taste beliefs and attributes review to the original recommendation impression
router.post('/recommendations/:itemId/feedback', authMiddleware, async (req, res) => {
  try {
    const {
      movieId,
      enjoyment,                // 1-5
      recommendationAccuracy,   // 1-5
      moodMatch,                // 'Yes', 'Partly', 'No'
      reasonTags = []           // ['genre', 'story', 'pacing', 'cast', 'runtime', 'language', 'content']
    } = req.body;

    if (!movieId || !enjoyment || !recommendationAccuracy) {
      return res.status(400).json({ error: 'movieId, enjoyment (1-5), and recommendationAccuracy (1-5) are required.' });
    }

    // Retrieve movie genres from AI catalogue
    const movieRes = await axios.get(`${config.AI_SERVICE_URL}/movies/${movieId}`);
    const movie = movieRes.data?.movie;
    const genres = movie?.genres || [];

    // Current user beliefs
    const currentBeliefs = storage.getUserBeliefs(req.user.id);

    // Call Python FastAPI Bayesian update engine
    const aiUpdateRes = await axios.post(`${config.AI_SERVICE_URL}/feedback/bayesian-update`, {
      movie_genres: genres,
      enjoyment: Number(enjoyment),
      recommendation_accuracy: Number(recommendationAccuracy),
      mood_match: moodMatch || 'Yes',
      reason_tags: reasonTags,
      user_beliefs: currentBeliefs
    });

    const updatedBeliefs = aiUpdateRes.data.updated_user_beliefs;
    storage.saveUserBeliefs(req.user.id, updatedBeliefs);

    // Persist review record with attribution to recommendation item
    const reviewRecord = {
      id: `rev_${uuidv4().replace(/-/g, '').slice(0, 10)}`,
      userId: req.user.id,
      movieId,
      recommendationItemId: req.params.itemId,
      enjoyment: Number(enjoyment),
      recommendationAccuracy: Number(recommendationAccuracy),
      moodMatch: moodMatch || 'Yes',
      reasonTags,
      diagnosticTrace: aiUpdateRes.data.diagnostic_trace,
      createdAt: new Date().toISOString()
    };
    storage.savePostWatchReview(reviewRecord);

    // Record completed watch event
    storage.recordWatchEvent({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: req.user.id,
      movieId,
      eventType: 'completed_watch',
      value: enjoyment,
      occurredAt: new Date().toISOString()
    });

    storage.logAudit(req.user.id, 'POST_WATCH_REVIEW_SUBMITTED', {
      reviewId: reviewRecord.id,
      movieId,
      enjoyment,
      recommendationAccuracy
    });

    return res.status(201).json({
      message: 'Post-watch review saved. Preference beliefs updated via Bayesian inference.',
      review: reviewRecord,
      updatedBeliefs,
      learningTrace: aiUpdateRes.data.diagnostic_trace
    });
  } catch (err) {
    console.error('Feedback submission error:', err.message);
    return res.status(502).json({ error: 'Failed to process post-watch feedback.' });
  }
});

// Get user watch history & past reviews
router.get('/users/me/history', authMiddleware, async (req, res) => {
  const history = storage.getUserWatchHistory(req.user.id);
  const reviews = storage.getUserReviews(req.user.id);

  // Enrich with movie titles
  const moviesRes = await axios.get(`${config.AI_SERVICE_URL}/movies?limit=200`);
  const movieMap = {};
  (moviesRes.data?.movies || []).forEach(m => { movieMap[m.id] = m; });

  const enrichedHistory = history.map(h => ({
    ...h,
    movie: movieMap[h.movieId] || { id: h.movieId, title: 'Movie' }
  }));

  const enrichedReviews = reviews.map(r => ({
    ...r,
    movie: movieMap[r.movieId] || { id: r.movieId, title: 'Movie' }
  }));

  return res.json({
    history: enrichedHistory,
    reviews: enrichedReviews
  });
});

// Get user's learned preference beliefs
router.get('/users/me/preferences', authMiddleware, (req, res) => {
  const beliefs = storage.getUserBeliefs(req.user.id);
  return res.json({
    userId: req.user.id,
    genreBeliefs: beliefs
  });
});

// Reset user's learned preferences
router.post('/users/me/preferences/reset', authMiddleware, (req, res) => {
  storage.resetUserBeliefs(req.user.id);
  storage.logAudit(req.user.id, 'PREFERENCES_RESET', {});
  return res.json({
    message: 'Learned preference beliefs reset to default priors.',
    genreBeliefs: {}
  });
});

module.exports = router;
