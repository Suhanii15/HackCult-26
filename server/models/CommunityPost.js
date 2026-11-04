const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorDistrict: {
      type: String,
      default: 'Gujarat',
      trim: true,
    },
    authorAvatar: {
      type: String,
      default: null,
    },
    tag: {
      type: String,
      default: '🌱 Eco Move',
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: [3, 'Post title must be at least 3 characters'],
      maxlength: [120, 'Post title cannot exceed 120 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      minlength: [5, 'Post content must be at least 5 characters'],
      maxlength: [1500, 'Post content cannot exceed 1500 characters'],
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    celebratesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'flagged', 'deleted'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-performance server-side sorting
communityPostSchema.index({ status: 1, createdAt: -1 });
communityPostSchema.index({ status: 1, likesCount: -1 });
communityPostSchema.index({ status: 1, celebratesCount: -1 });
communityPostSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
