const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    activityId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleKey: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    whyItMatters: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      default: '',
    },
    completionCriteria: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['energy', 'transport', 'waste', 'water'],
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: ['daily_habit', 'one_time', 'periodic_goal'],
      default: 'daily_habit',
    },
    durationDays: {
      type: Number,
      required: true,
      default: 7, // 7 days or 1 for one-time
    },
    requiredCheckIns: {
      type: Number,
      required: true,
      default: 6,
    },
    ecoScoreReward: {
      type: Number,
      required: true,
      default: 5,
    },
    greenPointsReward: {
      type: Number,
      required: true,
      default: 20,
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },
    cooldownDays: {
      type: Number,
      default: 1, // 1 day cooldown after completion before restart
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', ActivitySchema);
