const CommunityPost = require('../models/CommunityPost');
const CommunityPostLike = require('../models/CommunityPostLike');
const CommunityPostCelebrate = require('../models/CommunityPostCelebrate');

/**
 * Format a post document for client consumption, calculating relative time.
 */
function formatPost(post, currentUserId, userLikedSet = new Set(), userCelebratedSet = new Set()) {
  const p = post.toObject ? post.toObject() : post;
  const isOwner = currentUserId ? String(p.userId) === String(currentUserId) : false;
  const isLiked = userLikedSet.has(String(p._id));
  const isCelebrated = userCelebratedSet.has(String(p._id));

  // Compute friendly relative time
  let timeStr = 'Just now';
  if (p.createdAt) {
    const diffMs = Date.now() - new Date(p.createdAt).getTime();
    const diffMin = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) timeStr = `${diffDays}d ago`;
    else if (diffHours > 0) timeStr = `${diffHours}h ago`;
    else if (diffMin > 0) timeStr = `${diffMin}m ago`;
    else timeStr = 'Just now';
  }

  return {
    id: String(p._id),
    _id: String(p._id),
    userId: String(p.userId),
    author: p.authorName || 'Citizen',
    district: p.authorDistrict || 'Gujarat',
    authorAvatar: p.authorAvatar || null,
    time: timeStr,
    tag: p.tag || '🌱 Eco Move',
    title: p.title,
    body: p.content,
    content: p.content,
    likes: p.likesCount || 0,
    likesCount: p.likesCount || 0,
    celebrates: p.celebratesCount || 0,
    celebratesCount: p.celebratesCount || 0,
    isLiked,
    isCelebrated,
    isOwner,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/**
 * @desc    Create a new community post
 * @route   POST /api/v1/community/posts
 * @access  Private
 */
exports.createPost = async (req, res) => {
  try {
    const { title, body, content, tag } = req.body;
    const postBody = content || body;

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Post title is required and must be at least 3 characters long',
      });
    }

    if (!postBody || typeof postBody !== 'string' || postBody.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required and must be at least 5 characters long',
      });
    }

    const authorName = req.user.fullName || req.user.name || 'Eco Citizen';
    const authorDistrict = req.user.district || 'Gujarat';
    const authorAvatar = req.user.avatar || null;

    const post = await CommunityPost.create({
      userId: req.user._id,
      authorName,
      authorDistrict,
      authorAvatar,
      tag: (tag && tag.trim()) || '🌱 Eco Move',
      title: title.trim(),
      content: postBody.trim(),
      likesCount: 0,
      celebratesCount: 0,
      status: 'active',
    });

    const formatted = formatPost(post, req.user._id);

    res.status(201).json({
      success: true,
      data: formatted,
      post: formatted,
    });
  } catch (err) {
    console.error('Error creating community post:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while creating post',
    });
  }
};

/**
 * @desc    Fetch community posts feed with server-side sorting, filter & pagination
 * @route   GET /api/v1/community/posts
 * @access  Public / Optional Auth
 */
exports.getFeed = async (req, res) => {
  try {
    const currentUserId = req.user ? String(req.user._id) : null;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '15', 10)));
    const skip = (page - 1) * limit;

    const { sort, tag } = req.query;

    const filter = { status: 'active' };

    // My Posts filter (requires authenticated user)
    if (sort === 'mine') {
      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to view your own posts',
        });
      }
      filter.userId = req.user._id;
    }

    if (tag && tag !== 'all') {
      filter.tag = tag;
    }

    // Determine sort order
    let sortObj = { createdAt: -1 };
    if (sort === 'liked') {
      sortObj = { likesCount: -1, createdAt: -1 };
    } else if (sort === 'celebrated') {
      sortObj = { celebratesCount: -1, createdAt: -1 };
    } else if (sort === 'recent' || sort === 'mine') {
      sortObj = { createdAt: -1 };
    }

    const [total, rawPosts] = await Promise.all([
      CommunityPost.countDocuments(filter),
      CommunityPost.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Batch resolve like & celebrate states for requesting user
    const postIds = rawPosts.map((p) => p._id);
    const userLikedSet = new Set();
    const userCelebratedSet = new Set();

    if (currentUserId && postIds.length > 0) {
      const [userLikes, userCelebrates] = await Promise.all([
        CommunityPostLike.find({ userId: currentUserId, postId: { $in: postIds } }).lean(),
        CommunityPostCelebrate.find({ userId: currentUserId, postId: { $in: postIds } }).lean(),
      ]);
      userLikes.forEach((l) => userLikedSet.add(String(l.postId)));
      userCelebrates.forEach((c) => userCelebratedSet.add(String(c.postId)));
    }

    const formattedPosts = rawPosts.map((p) =>
      formatPost(p, currentUserId, userLikedSet, userCelebratedSet)
    );

    res.status(200).json({
      success: true,
      count: formattedPosts.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: skip + formattedPosts.length < total,
      data: formattedPosts,
      posts: formattedPosts,
    });
  } catch (err) {
    console.error('Error fetching community feed:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching community posts',
    });
  }
};

/**
 * @desc    Get a single community post by ID
 * @route   GET /api/v1/community/posts/:id
 * @access  Public / Optional Auth
 */
exports.getPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findOne({
      _id: req.params.id,
      status: { $ne: 'deleted' },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Community post not found',
      });
    }

    const currentUserId = req.user ? String(req.user._id) : null;
    const userLikedSet = new Set();
    const userCelebratedSet = new Set();

    if (currentUserId) {
      const [liked, celebrated] = await Promise.all([
        CommunityPostLike.exists({ postId: post._id, userId: currentUserId }),
        CommunityPostCelebrate.exists({ postId: post._id, userId: currentUserId }),
      ]);
      if (liked) userLikedSet.add(String(post._id));
      if (celebrated) userCelebratedSet.add(String(post._id));
    }

    const formatted = formatPost(post, currentUserId, userLikedSet, userCelebratedSet);

    res.status(200).json({
      success: true,
      data: formatted,
      post: formatted,
    });
  } catch (err) {
    console.error('Error fetching post by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post',
    });
  }
};

/**
 * @desc    Update own post
 * @route   PUT /api/v1/community/posts/:id
 * @access  Private
 */
exports.updatePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Community post not found',
      });
    }

    // Authorization check: only author can edit
    if (String(post.userId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this post',
      });
    }

    const { title, body, content, tag } = req.body;
    if (title && title.trim().length >= 3) {
      post.title = title.trim();
    }
    const nextBody = content || body;
    if (nextBody && nextBody.trim().length >= 5) {
      post.content = nextBody.trim();
    }
    if (tag && tag.trim()) {
      post.tag = tag.trim();
    }

    await post.save();

    const formatted = formatPost(post, req.user._id);

    res.status(200).json({
      success: true,
      data: formatted,
      post: formatted,
    });
  } catch (err) {
    console.error('Error updating community post:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating post',
    });
  }
};

/**
 * @desc    Delete own post
 * @route   DELETE /api/v1/community/posts/:id
 * @access  Private
 */
exports.deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Community post not found',
      });
    }

    // Authorization check: only author can delete
    if (String(post.userId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post',
      });
    }

    post.status = 'deleted';
    await post.save();

    // Clean up likes and celebrations
    await Promise.all([
      CommunityPostLike.deleteMany({ postId: post._id }),
      CommunityPostCelebrate.deleteMany({ postId: post._id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      id: String(post._id),
    });
  } catch (err) {
    console.error('Error deleting community post:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post',
    });
  }
};

/**
 * @desc    Like a post (unique & idempotent)
 * @route   POST /api/v1/community/posts/:id/like
 * @access  Private
 */
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await CommunityPost.findOne({ _id: postId, status: 'active' });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    try {
      await CommunityPostLike.create({
        postId,
        userId: req.user._id,
      });

      // Atomic increment
      const updated = await CommunityPost.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: 1 } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        isLiked: true,
        likesCount: updated.likesCount,
        likes: updated.likesCount,
      });
    } catch (err) {
      // E11000 duplicate key -> already liked
      if (err.code === 11000) {
        return res.status(200).json({
          success: true,
          isLiked: true,
          likesCount: post.likesCount,
          likes: post.likesCount,
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while liking post',
    });
  }
};

/**
 * @desc    Unlike a post
 * @route   DELETE /api/v1/community/posts/:id/like
 * @access  Private
 */
exports.unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await CommunityPost.findOne({ _id: postId, status: 'active' });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const removed = await CommunityPostLike.findOneAndDelete({
      postId,
      userId: req.user._id,
    });

    let currentLikes = post.likesCount;
    if (removed) {
      const updated = await CommunityPost.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: -1 } },
        { new: true }
      );
      currentLikes = Math.max(0, updated.likesCount);
      if (updated.likesCount < 0) {
        await CommunityPost.findByIdAndUpdate(postId, { likesCount: 0 });
      }
    }

    return res.status(200).json({
      success: true,
      isLiked: false,
      likesCount: currentLikes,
      likes: currentLikes,
    });
  } catch (err) {
    console.error('Error unliking post:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while unliking post',
    });
  }
};

/**
 * @desc    Celebrate a post (unique & idempotent)
 * @route   POST /api/v1/community/posts/:id/celebrate
 * @access  Private
 */
exports.celebratePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await CommunityPost.findOne({ _id: postId, status: 'active' });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    try {
      await CommunityPostCelebrate.create({
        postId,
        userId: req.user._id,
      });

      // Atomic increment
      const updated = await CommunityPost.findByIdAndUpdate(
        postId,
        { $inc: { celebratesCount: 1 } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        isCelebrated: true,
        celebratesCount: updated.celebratesCount,
        celebrates: updated.celebratesCount,
      });
    } catch (err) {
      // E11000 duplicate key -> already celebrated
      if (err.code === 11000) {
        return res.status(200).json({
          success: true,
          isCelebrated: true,
          celebratesCount: post.celebratesCount,
          celebrates: post.celebratesCount,
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('Error celebrating post:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while celebrating post',
    });
  }
};

/**
 * @desc    Remove celebration from a post
 * @route   DELETE /api/v1/community/posts/:id/celebrate
 * @access  Private
 */
exports.removeCelebrate = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await CommunityPost.findOne({ _id: postId, status: 'active' });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const removed = await CommunityPostCelebrate.findOneAndDelete({
      postId,
      userId: req.user._id,
    });

    let currentCelebrates = post.celebratesCount;
    if (removed) {
      const updated = await CommunityPost.findByIdAndUpdate(
        postId,
        { $inc: { celebratesCount: -1 } },
        { new: true }
      );
      currentCelebrates = Math.max(0, updated.celebratesCount);
      if (updated.celebratesCount < 0) {
        await CommunityPost.findByIdAndUpdate(postId, { celebratesCount: 0 });
      }
    }

    return res.status(200).json({
      success: true,
      isCelebrated: false,
      celebratesCount: currentCelebrates,
      celebrates: currentCelebrates,
    });
  } catch (err) {
    console.error('Error removing celebration:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while removing celebration',
    });
  }
};

/**
 * @desc    Fetch posts belonging to current user
 * @route   GET /api/v1/community/my-posts
 * @access  Private
 */
exports.getMyPosts = async (req, res) => {
  req.query.sort = 'mine';
  return exports.getFeed(req, res);
};
