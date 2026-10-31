const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All user routes are protected

router.route('/me').get(getProfile).patch(updateProfile);

module.exports = router;
