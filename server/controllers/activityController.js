const { getQuestionnaire } = require('../../shared/activities/questionnaires');
const { generatePersonalizedPlan } = require('../../shared/activities/recommendationEngine');
const Activity = require('../models/Activity');
const UserActivityCycle = require('../models/UserActivityCycle');
const ActivityCheckIn = require('../models/ActivityCheckIn');
const GreenPointTransaction = require('../models/GreenPointTransaction');
const EcoScoreTransaction = require('../models/EcoScoreTransaction');
const UserDismissedActivity = require('../models/UserDismissedActivity');
const User = require('../models/User');
const { computeCarbonSaving } = require('../../shared/activities/activityCatalog');

const DAY_MS = 24 * 60 * 60 * 1000;

// Helper to get formatted calendar date (YYYY-MM-DD)
const getCalendarDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const newestFirst = (a, b) =>
  new Date(b.createdAt) - new Date(a.createdAt) || String(b._id).localeCompare(String(a._id));

// Zero-based day index within the cycle ("Day 0" on the day it starts)
const getDayIndex = (cycle) =>
  Math.min(
    cycle.durationDays || 7,
    Math.max(0, Math.floor((Date.now() - new Date(cycle.startDate).getTime()) / DAY_MS))
  );

// Plain cycle object enriched with the fields the client screens read
const enrichCycle = (cycle, todayCheckedIn) => {
  const obj = typeof cycle.toObject === 'function' ? cycle.toObject() : { ...cycle };
  const currentDayIndex = getDayIndex(obj);
  const dayPlanItem = Array.isArray(obj.dailyPlan)
    ? obj.dailyPlan.find((p) => p.day === currentDayIndex + 1) || obj.dailyPlan[0]
    : null;

  return {
    ...obj,
    isCompleted: obj.status === 'completed',
    currentDayIndex,
    hasCheckedInToday: Boolean(todayCheckedIn),
    todayPlanAction: dayPlanItem ? dayPlanItem.action : '',
  };
};

// ---------------------------------------------------------------------------
// Rewards & completion (backend-authoritative, idempotent)
// ---------------------------------------------------------------------------

/**
 * Atomically transitions an active cycle to "completed" and awards rewards exactly once.
 * Only the request that wins the status transition awards anything, so duplicate or
 * concurrent completion requests can never double-reward.
 */
const completeCycle = async (cycleId, activity) => {
  const ecoScorePoints = activity.ecoScoreReward;
  const greenPoints = activity.greenPointsReward;
  const now = new Date();

  const claimed = await UserActivityCycle.findOneAndUpdate(
    { _id: cycleId, status: 'active' },
    {
      $set: {
        status: 'completed',
        completedAt: now,
        ecoScoreAwarded: ecoScorePoints,
        greenPointsAwarded: greenPoints,
      },
    },
    { new: true }
  );

  if (!claimed) {
    // Someone else already completed (or it expired): no reward here.
    const current = await UserActivityCycle.findById(cycleId);
    return { cycle: current, rewards: null, justCompleted: false };
  }

  const category = activity.category;
  const carbonSaved = claimed.carbonSavedKgCO2e || 0;

  // Ledger entries (unique indexes also protect against duplicates per cycle)
  const ledger = [
    [
      GreenPointTransaction,
      {
        userId: claimed.userId,
        activityCycleId: claimed._id,
        activityId: activity.activityId,
        points: greenPoints,
        transactionType: 'challenge_completion',
        description: `Completed challenge: ${activity.title}`,
      },
    ],
    [
      EcoScoreTransaction,
      {
        userId: claimed.userId,
        activityCycleId: claimed._id,
        activityId: activity.activityId,
        category,
        points: ecoScorePoints,
        description: `EcoScore reward for ${activity.title}`,
      },
    ],
  ];
  for (const [Model, doc] of ledger) {
    try {
      await Model.create(doc);
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }

  // Atomic user update: GreenPoints, capped per-category/overall EcoScore, carbon total
  const catPath = `ecoScore.${category}`;
  await User.updateOne({ _id: claimed.userId }, [
    {
      $set: {
        totalPoints: { $add: [{ $ifNull: ['$totalPoints', 0] }, greenPoints] },
        totalCarbonSavedKg: {
          $round: [{ $add: [{ $ifNull: ['$totalCarbonSavedKg', 0] }, carbonSaved] }, 3],
        },
        [catPath]: { $min: [25, { $add: [{ $ifNull: [`$${catPath}`, 0] }, ecoScorePoints] }] },
      },
    },
    {
      $set: {
        'ecoScore.total': {
          $min: [
            100,
            {
              $add: [
                { $ifNull: ['$ecoScore.energy', 0] },
                { $ifNull: ['$ecoScore.transport', 0] },
                { $ifNull: ['$ecoScore.waste', 0] },
                { $ifNull: ['$ecoScore.water', 0] },
              ],
            },
          ],
        },
      },
    },
  ]);

  return {
    cycle: claimed,
    rewards: {
      ecoScore: ecoScorePoints,
      greenPoints,
      carbonSavedKgCO2e: carbonSaved,
    },
    justCompleted: true,
  };
};

/**
 * Brings a user's cycles up to date: expires overdue cycles and settles any cycle that
 * already met its requirement but was not yet finalised.
 */
const refreshUserCycles = async (userId) => {
  if (!userId) return;
  const now = new Date();

  await UserActivityCycle.updateMany(
    {
      userId,
      status: 'active',
      endDate: { $lt: now },
      $expr: { $lt: ['$successfulCheckIns', '$requiredCheckIns'] },
    },
    { $set: { status: 'expired', expiredAt: now } }
  );

  const ready = await UserActivityCycle.find({
    userId,
    status: 'active',
    $expr: { $gte: ['$successfulCheckIns', '$requiredCheckIns'] },
  });
  for (const cycle of ready) {
    const activity = await Activity.findOne({ activityId: cycle.activityId });
    if (activity) await completeCycle(cycle._id, activity);
  }
};

// Derive the user-facing lifecycle state for one activity from the user's cycles
const deriveStatus = (cycles, activity, todayStr) => {
  const activeCycle = cycles.find((c) => c.status === 'active') || null;
  if (activeCycle) {
    return { userStatus: 'active', canRestart: false, restartAvailableDate: null, activeCycle };
  }

  const latest = [...cycles].sort(newestFirst)[0];
  if (!latest) {
    return { userStatus: 'available', canRestart: true, restartAvailableDate: null, activeCycle: null };
  }

  if (latest.status === 'completed') {
    const completedDayStr = getCalendarDateString(latest.completedAt);
    const nextDay = new Date(latest.completedAt);
    nextDay.setDate(nextDay.getDate() + 1);
    return {
      userStatus: 'completed',
      // Can restart starting the next calendar day
      canRestart: completedDayStr < todayStr && Boolean(activity.isRecurring),
      restartAvailableDate: getCalendarDateString(nextDay),
      activeCycle: null,
    };
  }

  return { userStatus: 'expired', canRestart: true, restartAvailableDate: null, activeCycle: null };
};

// @desc    Get all activities (optionally filtered by category)
// @route   GET /api/v1/activities
// @access  Public
exports.getActivities = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const activities = await Activity.find(query).sort({ category: 1, durationDays: -1, activityId: 1 });

    let userCycles = [];
    let dismissedSet = new Set();
    let checkedTodayCycleIds = new Set();
    const todayStr = getCalendarDateString();

    if (req.user) {
      await refreshUserCycles(req.user._id);
      userCycles = await UserActivityCycle.find({ userId: req.user._id });
      const dismissed = await UserDismissedActivity.find({ userId: req.user._id });
      dismissedSet = new Set(dismissed.map((d) => d.activityId));

      const activeIds = userCycles.filter((c) => c.status === 'active').map((c) => c._id);
      if (activeIds.length) {
        const todays = await ActivityCheckIn.find({
          userActivityCycleId: { $in: activeIds },
          checkInDate: todayStr,
        });
        checkedTodayCycleIds = new Set(todays.map((c) => String(c.userActivityCycleId)));
      }
    }

    const formatted = activities.map((act) => {
      const cyclesForAct = userCycles.filter((c) => c.activityId === act.activityId);
      const status = deriveStatus(cyclesForAct, act, todayStr);

      return {
        ...act.toObject(),
        userStatus: status.userStatus,
        activeCycle: status.activeCycle
          ? enrichCycle(status.activeCycle, checkedTodayCycleIds.has(String(status.activeCycle._id)))
          : null,
        canRestart: status.canRestart,
        restartAvailableDate: status.restartAvailableDate,
        isDismissed: dismissedSet.has(act.activityId),
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
      activities: formatted,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get categories summary with activity counts & active counts
// @route   GET /api/v1/activities/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categoriesMeta = [
      {
        id: 'energy',
        name: 'Energy Conservation',
        titleKey: 'category_energy_title',
        description: 'Minimize appliance vampire drain, optimize AC thermostats and transition to high-efficiency LED lighting.',
        icon: '⚡',
        color: '#00897B',
      },
      {
        id: 'transport',
        name: 'Sustainable Transportation',
        titleKey: 'category_transport_title',
        description: 'Embrace walking, cycling, BRTS/metro transit and communal carpooling for daily commuting.',
        icon: '🚲',
        color: '#0284C7',
      },
      {
        id: 'waste',
        name: 'Waste Management',
        titleKey: 'category_waste_title',
        description: 'Segregate wet organic waste from recyclables, shun single-use plastics and adopt reusable essentials.',
        icon: '♻️',
        color: '#16A34A',
      },
      {
        id: 'water',
        name: 'Water Conservation',
        titleKey: 'category_water_title',
        description: 'Stop running faucets during hygiene routines, shorten showers and proactively repair plumbing leaks.',
        icon: '💧',
        color: '#0EA5E9',
      },
    ];

    let userActiveCycles = [];
    if (req.user) {
      await refreshUserCycles(req.user._id);
      userActiveCycles = await UserActivityCycle.find({
        userId: req.user._id,
        status: 'active',
      });
    }

    const allActivities = await Activity.find({ isActive: true });

    const categories = categoriesMeta.map((cat) => {
      const catActivities = allActivities.filter((a) => a.category === cat.id);
      const catActiveCount = userActiveCycles.filter((c) => {
        const matchingAct = allActivities.find((a) => a.activityId === c.activityId);
        return matchingAct && matchingAct.category === cat.id;
      }).length;

      return {
        ...cat,
        totalActivities: catActivities.length,
        activeActivities: catActiveCount,
      };
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
      categories,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single activity details with user status
// @route   GET /api/v1/activities/:activityId
// @access  Public
exports.getActivityDetail = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findOne({ activityId, isActive: true });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    let cyclesHistory = [];
    let isDismissed = false;
    let todayCheckedIn = false;
    const todayStr = getCalendarDateString();

    if (req.user) {
      await refreshUserCycles(req.user._id);
      cyclesHistory = await UserActivityCycle.find({ userId: req.user._id, activityId }).sort({ createdAt: -1 });

      const dismissed = await UserDismissedActivity.findOne({ userId: req.user._id, activityId });
      isDismissed = Boolean(dismissed);
    }

    const status = deriveStatus(cyclesHistory, activity, todayStr);
    let checkIns = [];
    if (status.activeCycle) {
      checkIns = await ActivityCheckIn.find({ userActivityCycleId: status.activeCycle._id }).sort({ checkInDate: 1 });
      todayCheckedIn = checkIns.some((c) => c.checkInDate === todayStr);
    }

    const questionnaire = getQuestionnaire(activityId);
    const formattedDetail = {
      ...activity.toObject(),
      userStatus: status.userStatus,
      activeCycle: status.activeCycle ? enrichCycle(status.activeCycle, todayCheckedIn) : null,
      todayCheckedIn,
      canRestart: status.canRestart,
      canRestartTomorrow: status.userStatus === 'completed' && !status.canRestart && Boolean(activity.isRecurring),
      restartAvailableDate: status.restartAvailableDate,
      isDismissed,
      historyCount: cyclesHistory.length,
      checkIns,
      questionnaire,
    };

    res.status(200).json({
      success: true,
      data: formattedDetail,
      activity: formattedDetail,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user's active activities
// @route   GET /api/v1/activities/users/me/active
// @access  Private
exports.getActiveActivities = async (req, res) => {
  try {
    await refreshUserCycles(req.user._id);

    const rawCycles = await UserActivityCycle.find({
      userId: req.user._id,
      status: 'active',
    }).sort({ createdAt: -1 });

    const todayStr = getCalendarDateString();
    const activeActivities = [];

    for (const cycle of rawCycles) {
      const activity = await Activity.findOne({ activityId: cycle.activityId });
      const checkInToday = await ActivityCheckIn.findOne({
        userActivityCycleId: cycle._id,
        checkInDate: todayStr,
      });
      const enriched = enrichCycle(cycle, checkInToday);

      activeActivities.push({
        cycle: enriched,
        activity: activity ? activity.toObject() : null,
        todayCheckedIn: Boolean(checkInToday),
        todayCheckInRecord: checkInToday || null,
        currentDayNumber: enriched.currentDayIndex,
        remainingDays: Math.max(0, Math.ceil((new Date(cycle.endDate) - new Date()) / DAY_MS)),
      });
    }

    res.status(200).json({
      success: true,
      count: activeActivities.length,
      data: activeActivities,
      activeActivities,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user's completed activities history
// @route   GET /api/v1/activities/users/me/completed
// @access  Private
exports.getCompletedActivities = async (req, res) => {
  try {
    await refreshUserCycles(req.user._id);
    const completedCycles = await UserActivityCycle.find({
      userId: req.user._id,
      status: 'completed',
    }).sort({ completedAt: -1 });

    const formatted = [];
    for (const cycle of completedCycles) {
      const activity = await Activity.findOne({ activityId: cycle.activityId });
      formatted.push({
        cycle: cycle.toObject(),
        activity: activity ? activity.toObject() : null,
      });
    }

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
      completedActivities: formatted,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user's expired activities history
// @route   GET /api/v1/activities/users/me/expired
// @access  Private
exports.getExpiredActivities = async (req, res) => {
  try {
    await refreshUserCycles(req.user._id);
    const expiredCycles = await UserActivityCycle.find({
      userId: req.user._id,
      status: 'expired',
    }).sort({ expiredAt: -1 });

    const formatted = [];
    for (const cycle of expiredCycles) {
      const activity = await Activity.findOne({ activityId: cycle.activityId });
      formatted.push({
        cycle: cycle.toObject(),
        activity: activity ? activity.toObject() : null,
      });
    }

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
      expiredActivities: formatted,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Action A: Start / Add to my goals (+)
// @route   POST /api/v1/activities/users/me/:activityId/start
// @access  Private
exports.startActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findOne({ activityId, isActive: true });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    await refreshUserCycles(req.user._id);

    // Check if an active cycle already exists
    const existingActive = await UserActivityCycle.findOne({
      userId: req.user._id,
      activityId,
      status: 'active',
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active cycle for this activity in progress.',
        cycle: existingActive,
      });
    }

    // Restart rules are based on the most recent cycle
    const cycles = await UserActivityCycle.find({ userId: req.user._id, activityId });
    const latest = [...cycles].sort(newestFirst)[0];

    if (latest && latest.status === 'completed') {
      if (!activity.isRecurring) {
        return res.status(400).json({
          success: false,
          message: 'This one-time activity has already been completed.',
        });
      }

      if (getCalendarDateString(latest.completedAt) >= getCalendarDateString()) {
        return res.status(400).json({
          success: false,
          message: 'Challenge completed today! You can restart it starting tomorrow with a fresh cycle.',
        });
      }
    } else if (!activity.isRecurring && cycles.some((c) => c.status === 'completed')) {
      return res.status(400).json({
        success: false,
        message: 'This one-time activity has already been completed.',
      });
    }

    const now = new Date();
    const durationDays = activity.durationDays || 7;
    const endDate = new Date(now.getTime() + durationDays * DAY_MS);

    let newCycle;
    try {
      const responses = req.body?.responses || null;
    let plan = null;
    if (responses && typeof responses === 'object' && Object.keys(responses).length > 0) {
      plan = generatePersonalizedPlan(activityId, responses, activity);
    }

    newCycle = await UserActivityCycle.create({
      userId: req.user._id,
      activityId,
      activityRef: activity._id,
      status: 'active',
      startDate: now,
      endDate,
      successfulCheckIns: 0,
      totalCheckIns: 0,
      requiredCheckIns: activity.requiredCheckIns || 6,
      durationDays,
      cycleNumber: cycles.length + 1,
      isPersonalized: Boolean(plan),
      baselineResponses: responses,
      currentUsage: plan?.currentUsage || '',
      recommendedTarget: plan?.recommendedTarget || '',
      recommendedReduction: plan?.recommendedReduction || '',
      resourceSavings: plan?.resourceSavings || { amount: 0, unit: '', formatted: '' },
      dailyPlan: plan?.dailyPlan || [],
      calculationMetadata: plan?.carbonSavings ? {
        ...plan.carbonSavings,
        carbonSavingsKgCO2e: plan.carbonSavings.totalCycleKgCO2e || plan.carbonSavings.perDayKgCO2e || 0,
      } : {},
    });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active cycle for this activity in progress.',
        });
      }
      throw err;
    }

    // Remove from dismissed if previously dismissed
    await UserDismissedActivity.findOneAndDelete({ userId: req.user._id, activityId });

    const cycleObj = enrichCycle(newCycle, false);
    res.status(201).json({
      success: true,
      message: `Started "${activity.title}". Welcome to Day 0!`,
      data: cycleObj,
      cycle: cycleObj,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Action B: Already achieved (✓) for one-time actions
// @route   POST /api/v1/activities/users/me/:activityId/already-achieved
// @access  Private
exports.alreadyAchievedActivity = async (req, res) => {
  let createdCycleId = null;
  try {
    const { activityId } = req.params;
    const activity = await Activity.findOne({ activityId, isActive: true });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // A multi-day habit must still satisfy its completion criteria through daily check-ins.
    if (activity.activityType === 'daily_habit' && activity.durationDays > 1) {
      return res.status(400).json({
        success: false,
        message: 'Multi-day habit challenges require daily check-in verification and cannot be instantly achieved.',
      });
    }

    const duplicateMessage = 'This one-time activity has already been confirmed and rewarded previously.';

    const existingCompleted = await UserActivityCycle.findOne({
      userId: req.user._id,
      activityId,
      status: 'completed',
    });
    if (existingCompleted) {
      return res.status(400).json({ success: false, message: duplicateMessage });
    }

    // Cancel any stray active cycle
    await UserActivityCycle.updateMany(
      { userId: req.user._id, activityId, status: 'active' },
      { $set: { status: 'expired', expiredAt: new Date() } }
    );

    const now = new Date();
    const carbon = computeCarbonSaving(activity, req.body?.quantity);
    const quantity = Number(req.body?.quantity);

    let cycle;
    try {
      // oneTimeKey has a unique index, so concurrent duplicate requests cannot both succeed
      cycle = await UserActivityCycle.create({
        userId: req.user._id,
        activityId,
        activityRef: activity._id,
        status: 'active',
        startDate: now,
        endDate: now,
        successfulCheckIns: 1,
        totalCheckIns: 1,
        requiredCheckIns: 1,
        durationDays: 1,
        cycleNumber: 1,
        carbonSavedKgCO2e: carbon,
        oneTimeKey: `${req.user._id}:${activityId}`,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ success: false, message: duplicateMessage });
      }
      throw err;
    }
    createdCycleId = cycle._id;

    await ActivityCheckIn.create({
      userActivityCycleId: cycle._id,
      userId: req.user._id,
      activityId,
      checkInDate: getCalendarDateString(now),
      completed: true,
      quantityCompleted: activity.allowsQuantityInput && Number.isFinite(quantity) && quantity > 0 ? quantity : null,
      carbonSavedKgCO2e: carbon,
      notes: 'Confirmed as already achieved',
    });

    // Award EcoScore & Green Points (exactly once)
    const result = await completeCycle(cycle._id, activity);
    createdCycleId = null;

    res.status(200).json({
      success: true,
      message: `Verified! +${activity.greenPointsReward} Green Points and +${activity.ecoScoreReward} EcoScore awarded! 🌿`,
      data: {
        cycle: result.cycle,
        pointsEarned: activity.greenPointsReward,
        ecoScoreAwarded: activity.ecoScoreReward,
        carbonSavedKgCO2e: carbon,
      },
      cycle: result.cycle,
      rewards: {
        greenPoints: activity.greenPointsReward,
        ecoScore: activity.ecoScoreReward,
        carbonSavedKgCO2e: carbon,
      },
    });
  } catch (err) {
    if (createdCycleId) {
      // Roll back a half-finished one-time completion so the user is not locked out
      await ActivityCheckIn.deleteMany({ userActivityCycleId: createdCycleId }).catch(() => {});
      await UserActivityCycle.deleteOne({ _id: createdCycleId, status: 'active' }).catch(() => {});
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Action C: Not for me (×) dismissal
// @route   POST /api/v1/activities/users/me/:activityId/dismiss
// @access  Private
exports.dismissActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findOne({ activityId });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    await UserDismissedActivity.findOneAndUpdate(
      { userId: req.user._id, activityId },
      { dismissedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Activity dismissed from recommendations.',
      data: { activityId },
      activityId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit daily check-in (Yes completed / No missed)
// @route   POST /api/v1/activities/users/me/cycles/:cycleId/check-ins
// @access  Private
exports.submitDailyCheckIn = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const { completed, checkInDate, quantity } = req.body;

    const owned = await UserActivityCycle.findOne({ _id: cycleId, userId: req.user._id });
    if (!owned) {
      return res.status(404).json({ success: false, message: 'Active cycle not found' });
    }

    // Expire overdue cycles / settle finished ones before validating
    await refreshUserCycles(req.user._id);
    const cycle = await UserActivityCycle.findById(cycleId);

    if (cycle.status === 'expired') {
      return res.status(400).json({ success: false, message: 'This activity cycle duration has ended.' });
    }
    if (cycle.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in: this activity cycle is already ${cycle.status}.`,
      });
    }

    // Check-ins may not be in the future nor before the cycle started
    const todayStr = getCalendarDateString();
    const targetDateStr = checkInDate || todayStr;
    if (targetDateStr > todayStr) {
      return res.status(400).json({ success: false, message: 'Cannot record a check-in for a future date.' });
    }
    if (targetDateStr < getCalendarDateString(cycle.startDate)) {
      return res.status(400).json({ success: false, message: 'Cannot record a check-in from before this challenge started.' });
    }

    const activity = await Activity.findOne({ activityId: cycle.activityId });
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    const isYes = completed === true || completed === 'true';
    // Carbon is calculated by the server from the activity's own factors; only a bounded
    // quantity (e.g. km, hours) is taken from the client, and only for a successful check-in.
    const carbon = isYes ? computeCarbonSaving(activity, quantity) : 0;
    const qtyNumber = Number(quantity);

    // Unique index (cycle + day) makes duplicate/concurrent check-ins impossible
    let checkIn;
    try {
      checkIn = await ActivityCheckIn.create({
        userActivityCycleId: cycle._id,
        userId: req.user._id,
        activityId: cycle.activityId,
        checkInDate: targetDateStr,
        completed: isYes,
        quantityCompleted:
          isYes && activity.allowsQuantityInput && Number.isFinite(qtyNumber) && qtyNumber > 0
            ? Math.min(qtyNumber, activity.maxQuantityValue || qtyNumber)
            : null,
        carbonSavedKgCO2e: carbon,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'You have already recorded your check-in for this activity today.',
        });
      }
      throw err;
    }

    // Atomic counter update (only while the cycle is still active)
    const updated = await UserActivityCycle.findOneAndUpdate(
      { _id: cycle._id, status: 'active' },
      {
        $inc: {
          totalCheckIns: 1,
          successfulCheckIns: isYes ? 1 : 0,
          carbonSavedKgCO2e: carbon,
        },
      },
      { new: true }
    );

    if (!updated) {
      await ActivityCheckIn.deleteOne({ _id: checkIn._id });
      return res.status(409).json({
        success: false,
        message: 'This activity cycle was just finalised. Please refresh.',
      });
    }

    let finalCycle = updated;
    let justCompleted = false;
    let earnedRewards = null;

    if (updated.successfulCheckIns >= updated.requiredCheckIns) {
      const result = await completeCycle(updated._id, activity);
      finalCycle = result.cycle;
      justCompleted = result.justCompleted;
      earnedRewards = result.rewards;
    }

    const cycleObj = enrichCycle(finalCycle, true);

    res.status(200).json({
      success: true,
      message: justCompleted
        ? `🎉 Goal Achieved! Challenge completed with ${cycleObj.successfulCheckIns}/${cycleObj.requiredCheckIns} successful check-ins!`
        : isYes
        ? 'Great job! Check-in recorded for today. 🌿'
        : 'Noted. Keep going, tomorrow is a new opportunity!',
      data: { checkIn, cycle: cycleObj, justCompleted, rewards: earnedRewards, carbonSavedKgCO2e: carbon },
      checkIn,
      cycle: cycleObj,
      justCompleted,
      rewards: earnedRewards,
      carbonSavedKgCO2e: carbon,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single cycle details with its full check-in history
// @route   GET /api/v1/activities/users/me/cycles/:cycleId
// @access  Private
exports.getCycleDetails = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const owned = await UserActivityCycle.findOne({ _id: cycleId, userId: req.user._id });

    if (!owned) {
      return res.status(404).json({ success: false, message: 'Activity cycle not found' });
    }

    await refreshUserCycles(req.user._id);
    const cycle = await UserActivityCycle.findById(cycleId);

    const activity = await Activity.findOne({ activityId: cycle.activityId });
    const checkIns = await ActivityCheckIn.find({ userActivityCycleId: cycle._id }).sort({ checkInDate: 1 });

    const todayStr = getCalendarDateString();
    const todayCheckIn = checkIns.find((c) => c.checkInDate === todayStr);

    res.status(200).json({
      success: true,
      cycle: enrichCycle(cycle, todayCheckIn),
      activity,
      checkIns,
      todayCheckedIn: Boolean(todayCheckIn),
      todayCheckInRecord: todayCheckIn || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get assessment questionnaire for an activity
// @route   GET /api/v1/activities/:activityId/questionnaire
// @access  Public
exports.getActivityQuestionnaire = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findOne({ activityId, isActive: true });
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    const questionnaire = getQuestionnaire(activityId);
    res.status(200).json({
      success: true,
      data: questionnaire,
      questionnaire,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Generate personalized recommendation and impact calculation from user responses
// @route   POST /api/v1/activities/users/me/:activityId/assess
// @access  Private
exports.assessActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findOne({ activityId, isActive: true });
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    const responses = req.body.responses || req.body || {};
    const plan = generatePersonalizedPlan(activityId, responses, activity);
    res.status(200).json({
      success: true,
      data: plan,
      plan,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
