const mongoose = require('mongoose');

const GreenPointTransactionSchema = new mongoose.Schema(
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
    points: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['challenge_completion', 'already_achieved', 'welcome_bonus', 'other'],
      default: 'challenge_completion',
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reward transactions for the same cycle
GreenPointTransactionSchema.index(
  { activityCycleId: 1, transactionType: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('GreenPointTransaction', GreenPointTransactionSchema);
