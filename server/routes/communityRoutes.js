const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
  createPost,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  celebratePost,
  removeCelebrate,
  getMyPosts,
} = require('../controllers/communityController');

// Feed & creation
router.post('/posts', protect, createPost);
router.get('/posts', optionalAuth, getFeed);
router.get('/my-posts', protect, getMyPosts);

// Single post operations
router.get('/posts/:id', optionalAuth, getPostById);
router.put('/posts/:id', protect, updatePost);
router.delete('/posts/:id', protect, deletePost);

// Interactions: Like / Unlike
router.post('/posts/:id/like', protect, likePost);
router.delete('/posts/:id/like', protect, unlikePost);

// Interactions: Celebrate / Remove Celebrate
router.post('/posts/:id/celebrate', protect, celebratePost);
router.delete('/posts/:id/celebrate', protect, removeCelebrate);

module.exports = router;
