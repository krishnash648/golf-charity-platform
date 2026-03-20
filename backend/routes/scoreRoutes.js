const express = require('express');
const { authenticate } = require('../middleware/auth');
const { addScore, getScores, getGlobalLeaderboard } = require('../controllers/scoreController');

const router = express.Router();

// All score routes require authentication
router.use(authenticate);

// POST /api/scores - Add a new score
router.post('/', addScore);

// GET /api/scores - Get user's scores
router.get('/', getScores);

// GET /api/scores/leaderboard - Get global leaderboard
router.get('/leaderboard', getGlobalLeaderboard);

module.exports = router;
