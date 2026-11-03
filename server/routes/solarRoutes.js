const express = require('express');
const router = express.Router();
const { calculateSolar, createSolarEnquiry } = require('../controllers/solarController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimiter');

// Rate limiting: 60 calculations per minute per client
const calculateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many solar calculation requests, please try again shortly.',
});

// Rate limiting: 20 enquiries per minute per client
const enquiryLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many enquiry submissions, please try again shortly.',
});

router.post('/calculate', calculateLimiter, optionalAuth, calculateSolar);
router.post('/enquiry', enquiryLimiter, protect, createSolarEnquiry);

module.exports = router;
