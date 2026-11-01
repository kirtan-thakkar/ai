const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  PORT: process.env.PORT || 4000,
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001',
  JWT_SECRET: process.env.JWT_SECRET || 'fai_movie_secret_key_2026_jwt_token',
  JWT_EXPIRES_IN: '7d',
  DB_PATH: path.resolve(__dirname, '../../../database/db.json')
};
