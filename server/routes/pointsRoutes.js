const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/pointsController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Multi-scope Leaderboard supporting Green, Eco, and Carbon scores
router.get('/leaderboard', optionalAuth, getLeaderboard);

module.exports = router;
