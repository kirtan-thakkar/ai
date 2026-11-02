const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const storage = require('../storage');
const authMiddleware = require('../middleware/auth');

const MOVIE_THEATER_ENRICHMENTS = {
  m_inception: {
    trailerUrl: 'https://www.youtube-nocookie.com/embed/YoHD9XEInc0?enablejsapi=1&autoplay=1',
    trivia: [
      "Christopher Nolan built a massive 100-foot rotating centrifuge practical set with 500 crew members to film Arthur's zero-gravity hallway duel without CGI.",
      "The duration of the film (2 hours 28 minutes) is an intentional homage to the 2 min 28 sec runtime of Édith Piaf's 'Non, je ne regrette rien' which wakes dreamers.",
      "The names of the main characters—Dom, Robert, Eames, Arthur, Mal, Saito—form the word 'DREAMS'."
    ],
    dilemmaPoll: {
      id: 'poll_inception_1',
      question: "The Final Totem: Did the spinning top wobble and fall, meaning Cobb made it home to reality, or is he permanently trapped in Limbo?",
      options: ["Reality (He made it home)", "Dream / Limbo (Tragic illusion)"]
    },
    moodTension: "88% Psychological Suspense • 94% Mind-Bending Stakes"
  },
  m_interstellar: {
    trailerUrl: 'https://www.youtube-nocookie.com/embed/zSWdZVtXT7E?enablejsapi=1&autoplay=1',
    trivia: [
      "Nobel laureate physicist Kip Thorne provided the exact Einstein field equations used to render the black hole Gargantua, producing two published scientific papers.",
      "On Miller's ocean planet, the soundtrack ticks every 1.25 seconds. Each tick represents a full day passing on Earth.",
      "Christopher Nolan grew an actual 500-acre cornfield in Alberta, Canada for the dust storm farm scenes, and later sold the corn at a financial profit."
    ],
    dilemmaPoll: {
      id: 'poll_interstellar_1',
      question: "Miller's Planet Dilemma: Was Cooper right to risk 23 Earth years to investigate the first beacon signal?",
      options: ["Yes, every signal was vital", "No, critical mistake that cost decades"]
    },
    moodTension: "92% Cosmic Awe • 84% Emotional Gravity"
  },
  m_the_dark_knight: {
    trailerUrl: 'https://www.youtube-nocookie.com/embed/EXeTwQWrcwY?enablejsapi=1&autoplay=1',
    trivia: [
      "Heath Ledger locked himself in a London hotel room for 43 days formulating the Joker's psychology, iconic tongue tic, and diary of macabre thoughts.",
      "The hospital demolition scene was shot on an actual abandoned Brach's candy factory in Chicago using real explosives timed to a single continuous take.",
      "Michael Caine was so frightened by Ledger's unhinged performance during the penthouse elevator scene that he forgot his lines."
    ],
    dilemmaPoll: {
      id: 'poll_tdk_1',
      question: "The Ferry Prisoner's Dilemma: In real life with two detonators, which ferry boat would press the button first?",
      options: ["The Civilians boat", "The Prisoners boat", "Neither (Faith in humanity)"]
    },
    moodTension: "96% Psychological Anarchy • 89% Moral Stakes"
  },
  m_dune_part_1: {
    trailerUrl: 'https://www.youtube-nocookie.com/embed/n9xhJrPXop4?enablejsapi=1&autoplay=1',
    trivia: [
      "Hans Zimmer spent months crafting entirely new instruments and female vocal chants to avoid traditional Western orchestral tropes.",
      "Filmed in temperatures exceeding 120°F in the Rub' al Khali desert of Abu Dhabi and the cliffs of Wadi Rum in Jordan.",
      "Denis Villeneuve spent over a year specifically designing the sound and visual movement of the sandworm to resemble a living underwater whale."
    ],
    dilemmaPoll: {
      id: 'poll_dune_1',
      question: "Paul's Golden Path: Would you accept terrifying prescient visions of future holy war to save your people today?",
      options: ["Embrace the Prescience", "Reject the Prophecy"]
    },
    moodTension: "91% Epic Tension • 85% Mystical Wonder"
  },
  m_spiderman_spider_verse: {
    trailerUrl: 'https://www.youtube-nocookie.com/embed/g4Hbz2jLxvQ?enablejsapi=1&autoplay=1',
    trivia: [
      "Miles Morales is animated on 'twos' (12 fps) while Peter Parker is on 'ones' (24 fps), visually displaying Miles's awkwardness until his 'Leap of Faith'.",
      "Over 140 animators worked on the film—the largest animation team Sony Pictures Imageworks ever assembled.",
      "Every single frame was retouched by hand with comic-book halftone dots and hand-drawn line art."
    ],
    dilemmaPoll: {
      id: 'poll_spiderman_1',
      question: "The Leap of Faith: Can anyone wear the mask, or is a hero shaped solely by unavoidable personal loss?",
      options: ["Anyone can wear the mask", "Pain and loss define the spider"]
    },
    moodTension: "89% Kinetic Energy • 93% Creative Brilliance"
  },
  m_a_quiet_place: {
    trailerUrl: 'https://www.youtube-nocookie.com/embed/WR7cc5t7tv8?enablejsapi=1&autoplay=1',
    trivia: [
      "Only 25 lines of spoken dialogue exist in the entire 90-minute film.",
      "Millicent Simmonds, who plays Regan, is deaf in real life and guided the entire cast on American Sign Language nuances.",
      "Director John Krasinski performed the creature motion-capture himself for several key sequences."
    ],
    dilemmaPoll: {
      id: 'poll_qp_1',
      question: "Survival Priority: In an ultra-sound sensitive apocalypse, is having a newborn baby an unacceptable risk to the rest of the family?",
      options: ["Yes, impossible risk", "No, hope is worth the danger"]
    },
    moodTension: "98% Heart-Pounding Silence • 82% Family Survival"
  },
  m_palm_springs: {
    trailerUrl: 'https://www.youtube-nocookie.com/embed/CpBLtXdUEPk?enablejsapi=1&autoplay=1',
    trivia: [
      "Set a Sundance Film Festival sales record in 2020, selling for $17.5 million and exactly 69 cents.",
      "Andy Samberg and Cristin Milioti filmed the desert sequence during a heatwave of 115°F.",
      "Physicists were consulted to ensure Sarah's quantum mechanics explanation of Cauchy horizons held theoretical plausibility."
    ],
    dilemmaPoll: {
      id: 'poll_ps_1',
      question: "Nyles vs Sarah: Would you stay in a pain-free eternal time loop with the love of your life or risk dying to return to the real world?",
      options: ["Stay in the infinite loop", "Detonate the cave and face reality"]
    },
    moodTension: "84% Existential Humor • 76% Romantic Vibe"
  }
};

function getEnrichmentForMovie(movie) {
  if (movie && MOVIE_THEATER_ENRICHMENTS[movie.id]) {
    return MOVIE_THEATER_ENRICHMENTS[movie.id];
  }
  const cleanTitle = encodeURIComponent((movie?.title || 'movie') + ' official trailer');
  return {
    trailerUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${cleanTitle}&autoplay=1`,
    trivia: [
      `${movie?.title || 'This film'} features an IMDb score of ${movie?.imdb_rating || '7.5'}/10 and runtime of ${movie?.runtime || '115'} minutes.`,
      `Explores themes of ${(movie?.genres || ['Cinema']).join(' and ')} with calibrated mood alignment.`,
      `Curated by CineMind AI state-space recommendation and fairness engine.`
    ],
    dilemmaPoll: {
      id: `poll_${movie?.id || 'default'}`,
      question: `Room Decision: Does ${movie?.title || 'this story'} deliver primarily on character emotional depth or high-concept spectacle?`,
      options: ["Character & Emotional Stakes", "Visual Spectacle & World-Building"]
    },
    moodTension: `85% Dynamic Engagement • ${(movie?.genres || ['Film']).slice(0, 2).join(' / ')} Spectrum`
  };
}

// 1. Create Watch Party Room
router.post('/', authMiddleware, (req, res) => {
  const code = `WAR-${Math.floor(1000 + Math.random() * 9000)}`;
  const room = {
    id: `room_${uuidv4().replace(/-/g, '').slice(0, 10)}`,
    code,
    hostUserId: req.user.id,
    hostName: req.user.name || 'Host',
    status: 'lobby', // 'lobby' | 'consensus' | 'watching'
    members: [
      {
        userId: req.user.id,
        name: req.user.name || 'Host',
        role: 'host',
        likedGenres: ['Sci-Fi', 'Action'],
        dislikedGenres: ['Romance'],
        vetoes: ['Horror'],
        preferredMood: 'energetic',
        status: 'ready'
      }
    ],
    activeMovie: null,
    playback: {
      isPlaying: false,
      currentTime: 0,
      lastUpdated: new Date().toISOString(),
      updatedBy: req.user.name || 'Host'
    },
    chat: [
      {
        id: 'msg_welcome',
        senderName: 'CineMind Bot',
        text: `Room ${code} created. Share code "${code}" with a friend or open in a second browser to watch together!`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }
    ],
    pollVotes: {},
    recommendations: null,
    createdAt: new Date().toISOString()
  };

  storage.createWatchPartyRoom(room);
  storage.logAudit(req.user.id, 'WATCH_PARTY_CREATED', { roomId: room.id, code });
  return res.status(201).json(room);
});

// 2. Get Room by ID or Code
router.get('/:idOrCode', authMiddleware, (req, res) => {
  const room = storage.getWatchPartyRoom(req.params.idOrCode);
  if (!room) {
    return res.status(404).json({ error: 'Watch party room not found. Please verify the room code.' });
  }
  return res.json(room);
});

// 3. Join Room
router.post('/:idOrCode/join', authMiddleware, (req, res) => {
  const room = storage.getWatchPartyRoom(req.params.idOrCode);
  if (!room) {
    return res.status(404).json({ error: 'Watch party room not found. Please verify the room code.' });
  }

  const existingMember = room.members.find(m => m.userId === req.user.id);
  if (!existingMember) {
    const isFirstUserHost = room.members.length === 0;
    const newMember = {
      userId: req.user.id,
      name: req.user.name || `Viewer #${room.members.length + 1}`,
      role: isFirstUserHost ? 'host' : 'guest',
      likedGenres: ['Mystery', 'Thriller', 'Comedy'],
      dislikedGenres: ['Action'],
      vetoes: [],
      preferredMood: 'thoughtful',
      status: 'ready'
    };
    room.members.push(newMember);

    if (!room.chat) room.chat = [];
    room.chat.push({
      id: `msg_join_${Date.now()}`,
      senderName: 'CineMind Bot',
      text: `${newMember.name} joined the watch party! Ready for consensus.`,
      timestamp: new Date().toISOString(),
      isSystem: true
    });

    storage.updateWatchPartyRoom(room.id, { members: room.members, chat: room.chat });
  }

  return res.json(room);
});

// 4. Update Member Availability & Preferences
router.post('/:idOrCode/availability', authMiddleware, (req, res) => {
  const room = storage.getWatchPartyRoom(req.params.idOrCode);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const { likedGenres, dislikedGenres, vetoes, preferredMood } = req.body;
  const idx = room.members.findIndex(m => m.userId === req.user.id);

  if (idx !== -1) {
    room.members[idx] = {
      ...room.members[idx],
      likedGenres: likedGenres || room.members[idx].likedGenres,
      dislikedGenres: dislikedGenres || room.members[idx].dislikedGenres,
      vetoes: vetoes || room.members[idx].vetoes,
      preferredMood: preferredMood || room.members[idx].preferredMood
    };
    storage.updateWatchPartyRoom(room.id, { members: room.members });
  }

  return res.json({ message: 'Preferences updated.', room });
});

// 5. Generate Group Recommendation (2-Player Minimax or Collaborative Max-Min Fairness)
router.post('/:idOrCode/recommend', authMiddleware, async (req, res) => {
  try {
    const room = storage.getWatchPartyRoom(req.params.idOrCode);
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    const { mode = 'adversarial_minimax' } = req.body;

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

    const recData = aiRes.data;
    if (!room.chat) room.chat = [];
    
    const chosenTitle = recData.selected_movie?.title || recData.recommendations?.[0]?.movie?.title || 'Compromise Pick';
    room.chat.push({
      id: `msg_rec_${Date.now()}`,
      senderName: 'CineMind Arbiter',
      text: `Game-Theoretic Consensus reached: "${chosenTitle}" satisfies mutual utilities!`,
      timestamp: new Date().toISOString(),
      isSystem: true
    });

    storage.updateWatchPartyRoom(room.id, { recommendations: recData, chat: room.chat });
    return res.json(recData);
  } catch (err) {
    console.error('Group recommend error:', err.message);
    return res.status(502).json({ error: 'Failed to generate group recommendations.' });
  }
});

// 6. Select Active Movie & Enter Theater Mode
router.post('/:idOrCode/select-movie', authMiddleware, (req, res) => {
  const room = storage.getWatchPartyRoom(req.params.idOrCode);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const { movie } = req.body;
  if (!movie) {
    return res.status(400).json({ error: 'Movie object is required.' });
  }

  const enrichment = getEnrichmentForMovie(movie);
  const fullMovie = {
    ...movie,
    trailerUrl: movie.trailerUrl || enrichment.trailerUrl,
    trivia: enrichment.trivia,
    dilemmaPoll: enrichment.dilemmaPoll,
    moodTension: enrichment.moodTension
  };

  room.activeMovie = fullMovie;
  room.status = 'watching';
  room.playback = {
    isPlaying: false,
    currentTime: 0,
    lastUpdated: new Date().toISOString(),
    updatedBy: req.user.name || 'Host'
  };
  room.pollVotes = {};

  if (!room.chat) room.chat = [];
  room.chat.push({
    id: `msg_play_${Date.now()}`,
    senderName: 'CineMind Bot',
    text: `Now playing "${fullMovie.title}". Playback synchronized for all room viewers!`,
    timestamp: new Date().toISOString(),
    isSystem: true
  });

  storage.updateWatchPartyRoom(room.id, {
    activeMovie: room.activeMovie,
    status: room.status,
    playback: room.playback,
    pollVotes: room.pollVotes,
    chat: room.chat
  });

  return res.json(room);
});

// 7. Synchronize Playback State (Play / Pause / Seek)
router.post('/:idOrCode/sync', authMiddleware, (req, res) => {
  const room = storage.getWatchPartyRoom(req.params.idOrCode);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const { isPlaying, currentTime } = req.body;
  room.playback = {
    isPlaying: Boolean(isPlaying),
    currentTime: Math.max(0, Number(currentTime) || 0),
    lastUpdated: new Date().toISOString(),
    updatedBy: req.user.name || 'Viewer'
  };

  storage.updateWatchPartyRoom(room.id, { playback: room.playback });
  return res.json(room.playback);
});

// 8. Live Room Chat & Floating Reactions
router.post('/:idOrCode/chat', authMiddleware, (req, res) => {
  const room = storage.getWatchPartyRoom(req.params.idOrCode);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const { text, reaction } = req.body;
  if (!text && !reaction) {
    return res.status(400).json({ error: 'Message text or reaction is required.' });
  }

  if (!room.chat) room.chat = [];
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    senderId: req.user.id,
    senderName: req.user.name || 'Viewer',
    text: text || '',
    reaction: reaction || null,
    timestamp: new Date().toISOString(),
    isSystem: false
  };

  room.chat.push(message);
  if (room.chat.length > 60) room.chat.shift();

  storage.updateWatchPartyRoom(room.id, { chat: room.chat });
  return res.status(201).json(message);
});

// 9. Submit Vote on AI Dilemma Poll
router.post('/:idOrCode/poll-vote', authMiddleware, (req, res) => {
  const room = storage.getWatchPartyRoom(req.params.idOrCode);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const { optionIndex } = req.body;
  if (optionIndex === undefined || optionIndex === null) {
    return res.status(400).json({ error: 'optionIndex is required.' });
  }

  if (!room.pollVotes) room.pollVotes = {};
  room.pollVotes[req.user.id] = {
    userName: req.user.name || 'Viewer',
    optionIndex: Number(optionIndex),
    votedAt: new Date().toISOString()
  };

  // Announce in chat
  if (!room.chat) room.chat = [];
  const selectedOptionText = room.activeMovie?.dilemmaPoll?.options?.[optionIndex] || `Option ${optionIndex + 1}`;
  room.chat.push({
    id: `msg_vote_${Date.now()}`,
    senderName: 'AI Co-Pilot',
    text: `${req.user.name || 'Viewer'} voted on dilemma: "${selectedOptionText}"`,
    timestamp: new Date().toISOString(),
    isSystem: true
  });

  storage.updateWatchPartyRoom(room.id, { pollVotes: room.pollVotes, chat: room.chat });
  return res.json({ pollVotes: room.pollVotes, chat: room.chat });
});

// 10. Switch Room Stage (Return to Lobby / Consensus)
router.post('/:idOrCode/stage', authMiddleware, (req, res) => {
  const room = storage.getWatchPartyRoom(req.params.idOrCode);
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  const { stage = 'lobby' } = req.body;
  room.status = stage;
  if (stage === 'lobby') {
    room.playback = {
      isPlaying: false,
      currentTime: 0,
      lastUpdated: new Date().toISOString(),
      updatedBy: req.user.name || 'Host'
    };
  }

  storage.updateWatchPartyRoom(room.id, { status: room.status, playback: room.playback });
  return res.json(room);
});

module.exports = router;
