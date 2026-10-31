const express = require('express');
const router = express.Router();
const {
  calculate,
  saveBaseline,
  getHistory,
} = require('../controllers/footprintController');
const { protect } = require('../middleware/authMiddleware');

// Calculate can be called anonymously during onboarding previews
router.post('/calculate', calculate);

// Saving baseline and viewing history require authentication
router.post('/baseline', protect, saveBaseline);
router.get('/history', protect, getHistory);

module.exports = router;
