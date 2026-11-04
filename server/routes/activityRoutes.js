const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
  getActivities,
  getCategories,
  getActivityDetail,
  getActiveActivities,
  getCompletedActivities,
  getExpiredActivities,
  startActivity,
  alreadyAchievedActivity,
  dismissActivity,
  submitDailyCheckIn,
  getCycleDetails,
  getActivityQuestionnaire,
  assessActivity,
} = require('../controllers/activityController');

// Catalogue routes
router.get('/', optionalAuth, getActivities);
router.get('/categories', optionalAuth, getCategories);
router.get('/:activityId', optionalAuth, getActivityDetail);
router.get('/:activityId/questionnaire', getActivityQuestionnaire);

// User-specific activity lifecycle routes
router.get('/users/me/active', protect, getActiveActivities);
router.get('/users/me/completed', protect, getCompletedActivities);
router.get('/users/me/expired', protect, getExpiredActivities);
router.post('/users/me/:activityId/assess', protect, assessActivity);
router.post('/users/me/:activityId/start', protect, startActivity);
router.post('/users/me/:activityId/already-achieved', protect, alreadyAchievedActivity);
router.post('/users/me/:activityId/dismiss', protect, dismissActivity);
router.post('/users/me/cycles/:cycleId/check-ins', protect, submitDailyCheckIn);
router.get('/users/me/cycles/:cycleId', protect, getCycleDetails);

module.exports = router;
