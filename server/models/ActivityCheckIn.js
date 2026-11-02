const mongoose = require('mongoose');

const ActivityCheckInSchema = new mongoose.Schema(
  {
    userActivityCycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserActivityCycle',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityId: {
      type: String,
      required: true,
    },
    checkInDate: {
      type: String, // Stored as 'YYYY-MM-DD' representing calendar day in user timezone
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
      default: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Enforce strictly ONE check-in per activity cycle per calendar day
ActivityCheckInSchema.index(
  { userActivityCycleId: 1, checkInDate: 1 },
  { unique: true }
);

module.exports = mongoose.model('ActivityCheckIn', ActivityCheckInSchema);
