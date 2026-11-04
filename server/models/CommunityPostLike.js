const mongoose = require('mongoose');

const communityPostLikeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique like per user per post at the database index level
communityPostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CommunityPostLike', communityPostLikeSchema);
