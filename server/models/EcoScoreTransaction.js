const mongoose = require('mongoose');

const EcoScoreTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityCycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserActivityCycle',
      index: true,
    },
    activityId: {
      type: String,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['energy', 'transport', 'waste', 'water'],
      index: true,
    },
    points: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate EcoScore reward for the same cycle
EcoScoreTransactionSchema.index(
  { activityCycleId: 1, category: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('EcoScoreTransaction', EcoScoreTransactionSchema);
