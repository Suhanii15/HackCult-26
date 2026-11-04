const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    activityId: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    titleKey: { type: String, required: true },
    description: { type: String, required: true },
    whyItMatters: { type: String, default: '' },
    instructions: { type: String, default: '' },
    completionCriteria: { type: String, default: '' },
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
    durationDays: { type: Number, required: true, default: 7 }, // 7 days or 1 for one-time
    requiredCheckIns: { type: Number, required: true, default: 6 },

    // Rewards (authoritative: awarded by the backend from these values only)
    ecoScoreReward: { type: Number, required: true, default: 5, min: 0 },
    greenPointsReward: { type: Number, required: true, default: 20, min: 0 },

    // Discovery metadata
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy', index: true },
    durationBucket: { type: String, enum: ['short', 'medium', 'long'], default: 'short', index: true },
    estimatedMinutes: { type: Number, default: 5 },
    timeRequiredText: { type: String, default: '5 min/day' },
    keywords: [{ type: String, trim: true }],

    // Carbon footprint & environmental impact (all values are ESTIMATES)
    carbonSavingKgCO2e: { type: Number, default: 0 }, // per impactUnit at the default quantity
    carbonPerQuantityKgCO2e: { type: Number, default: 0 }, // per 1 impactQuantityUnit (server calculation)
    totalCycleCarbonSavingKg: { type: Number, default: 0 }, // comparable total for a full challenge / projected period
    impactBasisDays: { type: Number, default: 0 }, // check-ins or projected days behind the total
    waterSavingLitres: { type: Number, default: 0 },
    impactUnit: { type: String, default: 'kg CO₂e per day' },
    impactQuantity: { type: Number, default: 1 },
    impactQuantityUnit: { type: String, default: 'action' },
    impactDuration: { type: String, default: '' },
    impactDescription: { type: String, default: '' },
    calculationMethod: { type: String, default: '' },
    emissionFactor: { type: String, default: '' },
    assumptions: { type: String, default: '' },
    impactType: {
      type: String,
      enum: [
        'electricity_saving',
        'avoided_vehicle_emissions',
        'waste_avoided_emissions',
        'water_energy_saving',
        'food_lifecycle_saving',
        'qualitative_ecosystem',
      ],
      default: 'electricity_saving',
    },
    isQuantitativeImpact: { type: Boolean, default: true },
    allowsQuantityInput: { type: Boolean, default: false },
    quantityInputLabel: { type: String, default: '' },
    defaultQuantityValue: { type: Number, default: 1 },
    maxQuantityValue: { type: Number, default: 0 },

    isRecurring: { type: Boolean, default: true },
    cooldownDays: { type: Number, default: 1 }, // 1 day cooldown after completion before restart
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', ActivitySchema);
