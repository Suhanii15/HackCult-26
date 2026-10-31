const FootprintLog = require('../models/FootprintLog');
const User = require('../models/User');
const path = require('path');

// Import shared calculation engine
const { calculateFootprint, config } = require(
  path.join(__dirname, '../../shared/engine/footprintEngine')
);

// @desc    Calculate footprint from payload (without necessarily saving)
// @route   POST /api/v1/footprint/calculate
// @access  Public or Private
exports.calculate = async (req, res, next) => {
  try {
    const { mode, members, roomShareCount, electricity, cooking, transport } = req.body;

    const result = calculateFootprint({
      mode: mode || 'household',
      members: members || 1,
      roomShareCount: roomShareCount || 1,
      electricity: electricity || {},
      cooking: cooking || {},
      transport: transport || {},
    });

    // Annual projections
    const annualKg = Math.round(result.total * 12 * 10) / 10;
    const annualTonnes = Math.round((annualKg / 1000) * 100) / 100;
    const perCapitaAnnualTonnes = Math.round((annualTonnes / (members || 1)) * 100) / 100;

    // Gujarat Urban baseline comparison (~4.10 tonnes CO2e/year per urban household)
    const gujaratAvg = 4.10;
    const diffPct = Math.round(((annualTonnes - gujaratAvg) / gujaratAvg) * 100);

    res.status(200).json({
      success: true,
      data: {
        ...result,
        annualCO2Kg: annualKg,
        annualCO2Tonnes: annualTonnes,
        perCapitaAnnualCO2Tonnes: perCapitaAnnualTonnes,
        comparison: {
          gujaratUrbanAvgTonnes: gujaratAvg,
          percentageDifference: diffPct,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save baseline footprint calculation from onboarding
// @route   POST /api/v1/footprint/baseline
// @access  Private
exports.saveBaseline = async (req, res, next) => {
  try {
    const {
      mode,
      members,
      roomShareCount,
      electricity,
      cooking,
      transport,
      appliances,
      habits,
      state,
      district,
      city,
    } = req.body;

    // Run deterministic calculation
    const result = calculateFootprint({
      mode: mode || 'household',
      members: members || 4,
      roomShareCount: roomShareCount || 1,
      electricity: electricity || {},
      cooking: cooking || {},
      transport: transport || {},
    });

    const annualKg = Math.round(result.total * 12 * 10) / 10;
    const annualTonnes = Math.round((annualKg / 1000) * 100) / 100;
    const perCapitaAnnualTonnes = Math.round((annualTonnes / (members || 1)) * 100) / 100;
    const gujaratAvg = 4.10;
    const diffPct = Math.round(((annualTonnes - gujaratAvg) / gujaratAvg) * 100);

    // Create FootprintLog entry
    const log = await FootprintLog.create({
      userId: req.user.id,
      periodType: 'baseline',
      mode: mode || 'household',
      totalMonthlyCO2Kg: result.total,
      annualCO2Kg: annualKg,
      annualCO2Tonnes: annualTonnes,
      perCapitaAnnualCO2Tonnes: perCapitaAnnualTonnes,
      breakdown: {
        electricity: {
          kg: result.categories?.electricity?.kg || 0,
          percentage: result.categories?.electricity?.percentage || 0,
        },
        cooking: {
          kg: result.categories?.cooking?.kg || 0,
          percentage: result.categories?.cooking?.percentage || 0,
        },
        transport: {
          kg: result.categories?.transport?.kg || 0,
          percentage: result.categories?.transport?.percentage || 0,
        },
      },
      comparison: {
        gujaratUrbanAvgTonnes: gujaratAvg,
        percentageDifference: diffPct,
      },
      rawInputsSnapshot: req.body,
    });

    // Update user's baseline, household data, and mark onboarding as complete
    const user = await User.findById(req.user.id);
    if (user) {
      user.onboardingCompleted = true;
      user.onboardingMode = mode || 'household';
      if (state) user.state = state;
      if (district) user.district = district;
      if (city) user.city = city;
      user.baselineMonthlyCO2Kg = result.total;
      user.baselineAnnualCO2Kg = annualKg;

      user.household = {
        size: members || 4,
        roomShareCount: roomShareCount || 1,
        houseType: user.household?.houseType || 'apartment',
        electricity: electricity || user.household?.electricity,
        cooking: cooking || user.household?.cooking,
        transport: transport || user.household?.transport,
        appliances: appliances || user.household?.appliances || [],
        habits: habits || user.household?.habits || {},
      };

      // Award baseline bonus points & badge if not already awarded
      const hasBaselineBadge = user.badgesEarned.some((b) => b.badgeCode === 'BASELINE_LOCKED');
      if (!hasBaselineBadge) {
        user.totalPoints += 50; // +50 bonus points for locking in baseline
        user.badgesEarned.push({
          badgeCode: 'BASELINE_LOCKED',
          badgeName: 'Climate Aware Citizen',
          earnedAt: new Date(),
        });
      }

      await user.save();
    }

    res.status(201).json({
      success: true,
      data: {
        logId: log._id,
        calculation: {
          ...result,
          annualCO2Kg: annualKg,
          annualCO2Tonnes: annualTonnes,
          perCapitaAnnualCO2Tonnes: perCapitaAnnualTonnes,
          comparison: {
            gujaratUrbanAvgTonnes: gujaratAvg,
            percentageDifference: diffPct,
          },
        },
        user: {
          id: user._id,
          onboardingCompleted: user.onboardingCompleted,
          totalPoints: user.totalPoints,
          baselineAnnualCO2Kg: user.baselineAnnualCO2Kg,
          badgesEarned: user.badgesEarned,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's footprint calculation history
// @route   GET /api/v1/footprint/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const logs = await FootprintLog.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};
