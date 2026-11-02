const mongoose = require('mongoose');

const UserDismissedActivitySchema = new mongoose.Schema(
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
    dismissedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UserDismissedActivitySchema.index({ userId: 1, activityId: 1 }, { unique: true });

module.exports = mongoose.model('UserDismissedActivity', UserDismissedActivitySchema);
