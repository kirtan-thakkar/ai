const fs = require('fs');
const path = require('path');
const config = require('./config');

const INITIAL_DB = {
  users: [],
  sessions: [],
  user_interests: {},       // userId -> list of { category, value, preference, weight }
  user_genre_beliefs: {},   // userId -> map of genre -> { alpha, beta, mean, variance, count }
  watchlists: [],           // list of { id, userId, name, movies: [] }
  recommendation_sessions: [], // list of session objects
  watch_events: [],         // list of { id, userId, movieId, eventType, value, occurredAt }
  post_watch_reviews: [],   // list of review records
  watch_party_rooms: [],    // list of rooms
  audit_events: []          // list of system audit events
};

class StorageEngine {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.init();
  }

  init() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    }
  }

  read() {
    try {
      const raw = fs.readFileSync(this.dbPath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading db.json:', err);
      return INITIAL_DB;
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing db.json:', err);
    }
  }

  // Users
  findUserByEmail(email) {
    const db = this.read();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    const db = this.read();
    return db.users.find(u => u.id === id);
  }

  createUser(user) {
    const db = this.read();
    db.users.push(user);
    // Initialize default watchlist
    db.watchlists.push({
      id: `wl_${user.id}_default`,
      userId: user.id,
      name: 'My Watchlist',
      movieIds: [],
      createdAt: new Date().toISOString()
    });
    this.write(db);
    return user;
  }

  updateUser(id, updates) {
    const db = this.read();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...updates, updatedAt: new Date().toISOString() };
      this.write(db);
      return db.users[idx];
    }
    return null;
  }

  // User Interests
  getUserInterests(userId) {
    const db = this.read();
    return db.user_interests[userId] || [];
  }

  saveUserInterests(userId, interests) {
    const db = this.read();
    db.user_interests[userId] = interests;
    this.write(db);
    return interests;
  }

  // User Bayesian Beliefs
  getUserBeliefs(userId) {
    const db = this.read();
    return db.user_genre_beliefs[userId] || {};
  }

  saveUserBeliefs(userId, beliefs) {
    const db = this.read();
    db.user_genre_beliefs[userId] = beliefs;
    this.write(db);
    return beliefs;
  }

  resetUserBeliefs(userId) {
    const db = this.read();
    delete db.user_genre_beliefs[userId];
    this.write(db);
    return {};
  }

  // Watchlists
  getUserWatchlists(userId) {
    const db = this.read();
    let userLists = db.watchlists.filter(w => w.userId === userId);
    if (userLists.length === 0) {
      const defaultList = {
        id: `wl_${userId}_default`,
        userId: userId,
        name: 'My Watchlist',
        movieIds: ['m_inception', 'm_interstellar', 'm_the_dark_knight', 'm_dune_part_1', 'm_parasite'],
        createdAt: new Date().toISOString()
      };
      db.watchlists.push(defaultList);
      this.write(db);
      userLists = [defaultList];
    }
    return userLists;
  }

  getWatchlist(id) {
    const db = this.read();
    return db.watchlists.find(w => w.id === id);
  }

  createWatchlist(watchlist) {
    const db = this.read();
    db.watchlists.push(watchlist);
    this.write(db);
    return watchlist;
  }

  updateWatchlist(id, updates) {
    const db = this.read();
    const idx = db.watchlists.findIndex(w => w.id === id);
    if (idx !== -1) {
      db.watchlists[idx] = { ...db.watchlists[idx], ...updates };
      this.write(db);
      return db.watchlists[idx];
    }
    return null;
  }

  // Recommendation Sessions
  saveRecommendationSession(session) {
    const db = this.read();
    db.recommendation_sessions.push(session);
    this.write(db);
    return session;
  }

  getRecommendationSession(id) {
    const db = this.read();
    return db.recommendation_sessions.find(s => s.id === id);
  }

  // Watch Events & Feedback
  recordWatchEvent(event) {
    const db = this.read();
    db.watch_events.push(event);
    this.write(db);
    return event;
  }

  getUserWatchHistory(userId) {
    const db = this.read();
    return db.watch_events
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
  }

  savePostWatchReview(review) {
    const db = this.read();
    db.post_watch_reviews.push(review);
    this.write(db);
    return review;
  }

  getUserReviews(userId) {
    const db = this.read();
    return db.post_watch_reviews
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Watch Party Rooms
  createWatchPartyRoom(room) {
    const db = this.read();
    if (!db.watch_party_rooms) db.watch_party_rooms = [];
    db.watch_party_rooms.push(room);
    this.write(db);
    return room;
  }

  getWatchPartyRoom(idOrCode) {
    const db = this.read();
    if (!db.watch_party_rooms) return null;
    const query = String(idOrCode || '').trim().toUpperCase();
    return db.watch_party_rooms.find(r => 
      (r.id && r.id.toUpperCase() === query) || 
      (r.code && r.code.toUpperCase() === query)
    );
  }

  updateWatchPartyRoom(idOrCode, updates) {
    const db = this.read();
    if (!db.watch_party_rooms) db.watch_party_rooms = [];
    const query = String(idOrCode || '').trim().toUpperCase();
    const idx = db.watch_party_rooms.findIndex(r => 
      (r.id && r.id.toUpperCase() === query) || 
      (r.code && r.code.toUpperCase() === query)
    );
    if (idx !== -1) {
      db.watch_party_rooms[idx] = { ...db.watch_party_rooms[idx], ...updates };
      this.write(db);
      return db.watch_party_rooms[idx];
    }
    return null;
  }

  // Audit Events
  logAudit(userId, action, metadata = {}) {
    const db = this.read();
    db.audit_events.push({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      action,
      metadata,
      createdAt: new Date().toISOString()
    });
    this.write(db);
  }
}

const storage = new StorageEngine(config.DB_PATH);
module.exports = storage;
