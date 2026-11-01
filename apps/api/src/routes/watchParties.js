const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const storage = require('../storage');
const authMiddleware = require('../middleware/auth');

// Create Watch Party Room
router.post('/', authMiddleware, (req, res) => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room = {
    id: `room_${uuidv4().replace(/-/g, '').slice(0, 10)}`,
    code,
    hostUserId: req.user.id,
    hostName: req.user.name,
    status: 'open',
    members: [
      {
        userId: req.user.id,
        name: req.user.name,
        role: 'host',
        likedGenres: ['Sci-Fi', 'Action'],
        dislikedGenres: [],
        vetoes: [],
        preferredMood: 'energetic',
        availability: ['19:00-23:00']
      }
    ],
    recommendations: [],
    createdAt: new Date().toISOString()
  };

  storage.createWatchPartyRoom(room);
  storage.logAudit(req.user.id, 'WATCH_PARTY_CREATED', { roomId: room.id, code });
  return res.status(201).json(room);
});

// Get Room by ID or Code
router.get('/:idOrCode', authMiddleware, (req, res) => {
  const room = storage.getWatchPartyRoom(req.params.idOrCode);
  if (!room) {
    return res.status(404).json({ error: 'Watch party room not found.' });
  }
  return res.json(room);
});

// Join Room
router.post('/:idOrCode/join', authMiddleware, (req, res) => {
  const room = storage.getWatchPartyRoom(req.params.idOrCode);
  if (!room) {
    return res.status(404).json({ error: 'Watch party room not found.' });
  }

  const existingMember = room.members.find(m => m.userId === req.user.id);
  if (!existingMember) {
    room.members.push({
      userId: req.user.id,
      name: req.user.name,
      role: 'member',
      likedGenres: ['Comedy', 'Drama'],
      dislikedGenres: [],
      vetoes: [],
      preferredMood: 'balanced',
      availability: ['19:00-23:00']
    });
    storage.updateWatchPartyRoom(room.id, { members: room.members });
  }

  return res.json(room);
});

// Submit Member Availability & Preferences
router.post('/:idOrCode/availability', authMiddleware, (req, res) => {
  const room = storage.getWatchPartyRoom(req.params.idOrCode);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const { likedGenres, dislikedGenres, vetoes, preferredMood, availability } = req.body;
  const idx = room.members.findIndex(m => m.userId === req.user.id);

  if (idx !== -1) {
    room.members[idx] = {
      ...room.members[idx],
      likedGenres: likedGenres || room.members[idx].likedGenres,
      dislikedGenres: dislikedGenres || room.members[idx].dislikedGenres,
      vetoes: vetoes || room.members[idx].vetoes,
      preferredMood: preferredMood || room.members[idx].preferredMood,
      availability: availability || room.members[idx].availability
    };
    storage.updateWatchPartyRoom(room.id, { members: room.members });
  }

  return res.json({ message: 'Preferences updated.', room });
});

// Generate Group Recommendation (Collaborative Max-Min Fairness or 2-Player Minimax)
router.post('/:idOrCode/recommend', authMiddleware, async (req, res) => {
  try {
    const room = storage.getWatchPartyRoom(req.params.idOrCode);
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    const { mode = 'collaborative_fairness' } = req.body;

    let aiRes;
    if (mode === 'adversarial_minimax' && room.members.length >= 2) {
      aiRes = await axios.post(`${config.AI_SERVICE_URL}/couch-war/minimax`, {
        player1: {
          liked_genres: room.members[0].likedGenres,
          disliked_genres: room.members[0].dislikedGenres,
          vetoes: room.members[0].vetoes
        },
        player2: {
          liked_genres: room.members[1].likedGenres,
          disliked_genres: room.members[1].dislikedGenres,
          vetoes: room.members[1].vetoes
        },
        mode: 'adversarial_minimax'
      });
    } else {
      aiRes = await axios.post(`${config.AI_SERVICE_URL}/couch-war/fairness`, {
        participants: room.members.map(m => ({
          name: m.name,
          liked_genres: m.likedGenres,
          disliked_genres: m.dislikedGenres,
          vetoes: m.vetoes,
          preferred_mood: m.preferredMood
        })),
        top_k: 3
      });
    }

    storage.updateWatchPartyRoom(room.id, { recommendations: aiRes.data });
    return res.json(aiRes.data);
  } catch (err) {
    console.error('Group recommend error:', err.message);
    return res.status(502).json({ error: 'Failed to generate group recommendations.' });
  }
});

module.exports = router;
