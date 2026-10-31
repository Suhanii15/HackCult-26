const mongoose = require('mongoose');

const FootprintLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    periodType: {
      type: String,
      enum: ['baseline', 'monthly_audit', 'what_if'],
      default: 'baseline',
    },
    mode: {
      type: String,
      enum: ['household', 'individual'],
      default: 'household',
    },
    totalMonthlyCO2Kg: {
      type: Number,
      required: true,
    },
    annualCO2Kg: {
      type: Number,
      required: true,
    },
    annualCO2Tonnes: {
      type: Number,
      required: true,
    },
    perCapitaAnnualCO2Tonnes: {
      type: Number,
      default: 0,
    },
    breakdown: {
      electricity: {
        kg: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
      },
      cooking: {
        kg: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
      },
      transport: {
        kg: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
      },
      appliances: {
        kg: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
      },
    },
    comparison: {
      gujaratUrbanAvgTonnes: { type: Number, default: 4.1 },
      percentageDifference: { type: Number, default: 0 },
    },
    rawInputsSnapshot: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

FootprintLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('FootprintLog', FootprintLogSchema);
