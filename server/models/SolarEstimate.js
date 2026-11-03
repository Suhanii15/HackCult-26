const mongoose = require('mongoose');

const solarEstimateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    inputs: {
      roofAreaSqft: { type: Number, required: true },
      monthlyBillInr: { type: Number, required: true },
      district: { type: String, default: 'Ahmedabad' },
      state: { type: String, default: 'Gujarat' },
      homeType: { type: String, default: 'independent' },
    },
    feasible: {
      type: Boolean,
      required: true,
    },
    reason: {
      type: String,
      default: null,
    },
    limitingFactor: {
      type: String,
      enum: ['roof', 'consumption', 'max', null],
      default: null,
    },
    capacityKw: {
      type: Number,
      default: 0,
    },
    discom: {
      type: String,
      default: 'PGVCL',
    },
    estimatedMonthlyUnits: {
      type: Number,
      default: 0,
    },
    annualGenerationKwh: {
      type: Number,
      default: 0,
    },
    financials: {
      costPerKw: Number,
      grossCostInr: Number,
      centralSubsidyInr: Number,
      stateSubsidyInr: Number,
      totalSubsidyInr: Number,
      netInvestmentInr: Number,
      year1SavingsInr: Number,
      monthlySavingsInr: Number,
      paybackYears: Number,
      verdict: String,
      lifetimeGrossSavingsInr: Number,
      lifetimeNetSavingsInr: Number,
    },
    environmental: {
      annualCo2AvoidedTonnes: Number,
      lifetimeCo2AvoidedTonnes: Number,
      totalLifetimeGenerationKwh: Number,
      gridEmissionFactor: Number,
      emissionsUnit: String,
    },
    estimatedFlags: {
      type: Map,
      of: Boolean,
      default: {},
    },
    assumptions: {
      type: Array,
      default: [],
    },
    configVersion: {
      type: String,
      default: '2026.1',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SolarEstimate', solarEstimateSchema);
