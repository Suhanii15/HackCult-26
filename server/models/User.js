const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email or phone identifier'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password hash by default
    },
    role: {
      type: String,
      enum: ['citizen', 'admin'],
      default: 'citizen',
    },
    state: {
      type: String,
      default: 'Gujarat',
    },
    district: {
      type: String,
      default: 'Ahmedabad',
      index: true,
    },
    city: {
      type: String,
      default: 'Ahmedabad',
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingMode: {
      type: String,
      enum: ['household', 'individual'],
      default: 'household',
    },
    // Household & Lifestyle inputs
    household: {
      size: { type: Number, default: 4 },
      roomShareCount: { type: Number, default: 1 },
      houseType: {
        type: String,
        enum: ['apartment', 'individual_house'],
        default: 'apartment',
      },
      electricity: {
        sourceType: { type: String, default: 'kwh' },
        kwh: { type: Number, default: 0 },
        amountInINR: { type: Number, default: 0 },
        solar: {
          hasSolar: { type: Boolean, default: false },
          solarKw: { type: Number, default: 0 },
          exportedKwh: { type: Number, default: 0 },
        },
      },
      cooking: {
        noCookingFuel: { type: Boolean, default: false },
        fuels: [
          {
            type: { type: String, default: 'lpg' },
            cylinderSizeKg: { type: Number, default: 14.2 },
            weeksPerCylinder: { type: Number, default: 6 },
            cylindersPerMonth: { type: Number, default: 0.7 },
          },
        ],
      },
      transport: {
        noRegularTravel: { type: Boolean, default: false },
        trips: [
          {
            id: { type: String },
            mode: { type: String, default: 'petrol_bike' },
            kmPerDay: { type: Number, default: 10 },
            daysPerMonth: { type: Number, default: 22 },
          },
        ],
        walkAlso: { type: Boolean, default: false },
        cycleAlso: { type: Boolean, default: false },
      },
      appliances: [{ type: String }],
      habits: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    // Footprint & Gamification metrics
    baselineAnnualCO2Kg: {
      type: Number,
      default: 0,
    },
    baselineMonthlyCO2Kg: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 50, // Starting welcome bonus
      index: -1,
    },
    ecoScore: {
      total: { type: Number, default: 0, min: 0, max: 100 },
      energy: { type: Number, default: 0, min: 0, max: 25 },
      transport: { type: Number, default: 0, min: 0, max: 25 },
      waste: { type: Number, default: 0, min: 0, max: 25 },
      water: { type: Number, default: 0, min: 0, max: 25 },
    },
    currentStreakDays: {
      type: Number,
      default: 1,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    badgesEarned: [
      {
        badgeCode: { type: String },
        badgeName: { type: String },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = mongoose.model('User', UserSchema);
