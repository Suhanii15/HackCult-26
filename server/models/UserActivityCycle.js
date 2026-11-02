const mongoose = require('mongoose');

const UserActivityCycleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityId: {
      type: String,
      required: true,
      index: true,
    },
    activityRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired'],
      default: 'active',
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
    },
    expiredAt: {
      type: Date,
    },
    successfulCheckIns: {
      type: Number,
      default: 0,
    },
    totalCheckIns: {
      type: Number,
      default: 0,
    },
    requiredCheckIns: {
      type: Number,
      default: 6,
    },
    durationDays: {
      type: Number,
      default: 7,
    },
    cycleNumber: {
      type: Number,
      default: 1,
    },
    ecoScoreAwarded: {
      type: Number,
      default: 0,
    },
    greenPointsAwarded: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find active cycle for a user and activity
UserActivityCycleSchema.index({ userId: 1, activityId: 1, status: 1 });

module.exports = mongoose.model('UserActivityCycle', UserActivityCycleSchema);
