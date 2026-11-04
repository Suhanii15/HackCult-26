const mongoose = require('mongoose');

const UserActivityCycleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    activityId: { type: String, required: true, index: true },
    activityRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
    status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active', index: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    completedAt: { type: Date },
    expiredAt: { type: Date },
    successfulCheckIns: { type: Number, default: 0 },
    totalCheckIns: { type: Number, default: 0 },
    requiredCheckIns: { type: Number, default: 6 },
    durationDays: { type: Number, default: 7 },
    cycleNumber: { type: Number, default: 1 },
    ecoScoreAwarded: { type: Number, default: 0 },
    greenPointsAwarded: { type: Number, default: 0 },
    // Estimated CO2e recorded by the server from successful check-ins of this cycle
    carbonSavedKgCO2e: { type: Number, default: 0 },
    // Personalized baseline & assessment plan
    isPersonalized: { type: Boolean, default: false },
    baselineResponses: { type: mongoose.Schema.Types.Mixed, default: null },
    currentUsage: { type: String, default: '' },
    recommendedTarget: { type: String, default: '' },
    recommendedReduction: { type: String, default: '' },
    resourceSavings: {
      amount: { type: Number, default: 0 },
      unit: { type: String, default: '' },
      formatted: { type: String, default: '' },
    },
    dailyPlan: [
      {
        day: { type: Number },
        action: { type: String },
      },
    ],
    calculationMetadata: {
      formula: { type: String, default: '' },
      emissionFactor: { type: String, default: '' },
      assumptions: { type: String, default: '' },
      isQuantitative: { type: Boolean, default: true },
      carbonSavingsKgCO2e: { type: Number, default: 0 },
      totalCycleKgCO2e: { type: Number, default: 0 },
      perDayKgCO2e: { type: Number, default: 0 },
      formatted: { type: String, default: '' },
    },
    // Set only for one-time "already achieved" completions: guarantees one per user+activity
    oneTimeKey: { type: String },
  },
  { timestamps: true }
);

// Compound index to quickly find active cycle for a user and activity
UserActivityCycleSchema.index({ userId: 1, activityId: 1, status: 1 });

// At most ONE active cycle per user+activity (guards against duplicate/concurrent start requests)
UserActivityCycleSchema.index(
  { userId: 1, activityId: 1 },
  { unique: true, partialFilterExpression: { status: 'active' }, name: 'unique_active_cycle' }
);

// At most one "already achieved" completion per user+activity
UserActivityCycleSchema.index(
  { oneTimeKey: 1 },
  { unique: true, partialFilterExpression: { oneTimeKey: { $type: 'string' } }, name: 'unique_one_time_key' }
);

module.exports = mongoose.model('UserActivityCycle', UserActivityCycleSchema);
