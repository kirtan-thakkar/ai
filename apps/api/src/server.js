const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const config = require('./config');

const authRoutes = require('./routes/auth');
const taxonomyRoutes = require('./routes/taxonomy');
const recommendationRoutes = require('./routes/recommendations');
const movieRoutes = require('./routes/movies');
const watchlistRoutes = require('./routes/watchlists');
const plannerRoutes = require('./routes/planner');
const watchPartyRoutes = require('./routes/watchParties');
const feedbackRoutes = require('./routes/feedback');
const assistantRoutes = require('./routes/assistant');
const vivaRoutes = require('./routes/viva');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API v1 Routing (as specified in Section 5)
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}`, authRoutes); // for /users/me
app.use(`${API_PREFIX}`, taxonomyRoutes); // for /interest-categories, /users/me/interests
app.use(`${API_PREFIX}`, recommendationRoutes); // for /recommendation-sessions, /recommendations/refine
app.use(`${API_PREFIX}/movies`, movieRoutes);
app.use(`${API_PREFIX}/watchlists`, watchlistRoutes);
app.use(`${API_PREFIX}/plans`, plannerRoutes);
app.use(`${API_PREFIX}/watch-parties`, watchPartyRoutes);
app.use(`${API_PREFIX}`, feedbackRoutes); // for /recommendations/:id/feedback, /users/me/history, /preferences
app.use(`${API_PREFIX}/assistant`, assistantRoutes);
app.use(`${API_PREFIX}/viva`, vivaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    layer: 'Node.js Express API Gateway',
    version: '1.0.0',
    port: config.PORT,
    aiServiceUrl: config.AI_SERVICE_URL
  });
});

// Static Frontend Serving in production
const staticPath = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/health')) {
      return res.sendFile(path.join(staticPath, 'index.html'));
    }
    next();
  });
}

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`Node API Gateway listening on port ${config.PORT} (API Base: ${API_PREFIX})`);
    console.log(`Connecting to AI service at ${config.AI_SERVICE_URL}`);
  });
}

module.exports = app;
