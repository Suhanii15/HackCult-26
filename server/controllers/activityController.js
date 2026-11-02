const Activity = require('../models/Activity');
const UserActivityCycle = require('../models/UserActivityCycle');
const ActivityCheckIn = require('../models/ActivityCheckIn');
const GreenPointTransaction = require('../models/GreenPointTransaction');
const EcoScoreTransaction = require('../models/EcoScoreTransaction');
const UserDismissedActivity = require('../models/UserDismissedActivity');
const User = require('../models/User');

// Helper to get formatted calendar date (YYYY-MM-DD)
const getCalendarDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to award points & EcoScore to user atomically
const awardCompletionRewards = async (user, activity, cycle) => {
  const category = activity.category;
  const ecoScorePoints = activity.ecoScoreReward || 5;
  const greenPoints = activity.greenPointsReward || 20;

  // 1. Award Green Points
  user.totalPoints = (user.totalPoints || 0) + greenPoints;

  // 2. Award EcoScore (capped at 25 per category and 100 overall)
  if (!user.ecoScore) {
    user.ecoScore = { total: 0, energy: 0, transport: 0, waste: 0, water: 0 };
  }
  const currentCatScore = user.ecoScore[category] || 0;
  const newCatScore = Math.min(25, currentCatScore + ecoScorePoints);
  user.ecoScore[category] = newCatScore;
  user.ecoScore.total = Math.min(
    100,
    (user.ecoScore.energy || 0) +
      (user.ecoScore.transport || 0) +
      (user.ecoScore.waste || 0) +
      (user.ecoScore.water || 0)
  );

  await user.save();

  // 3. Record GreenPointTransaction
  await GreenPointTransaction.findOneAndUpdate(
    { activityCycleId: cycle._id, transactionType: 'challenge_completion' },
    {
      userId: user._id,
      activityCycleId: cycle._id,
      activityId: activity.activityId,
      points: greenPoints,
      transactionType: 'challenge_completion',
      description: `Completed challenge: ${activity.title}`,
    },
    { upsert: true, new: true }
  );

  // 4. Record EcoScoreTransaction
  await EcoScoreTransaction.findOneAndUpdate(
    { activityCycleId: cycle._id, category },
    {
      userId: user._id,
      activityCycleId: cycle._id,
      activityId: activity.activityId,
      category,
      points: ecoScorePoints,
      description: `EcoScore reward for ${activity.title}`,
    },
    { upsert: true, new: true }
  );

  cycle.ecoScoreAwarded = ecoScorePoints;
  cycle.greenPointsAwarded = greenPoints;
};

// Helper to check and evaluate cycle expiration/completion
const evaluateCycleStatus = async (cycle, user) => {
  if (cycle.status !== 'active') return cycle;

  const now = new Date();
  const isPastEndDate = now > new Date(cycle.endDate);

  if (cycle.successfulCheckIns >= cycle.requiredCheckIns) {
    cycle.status = 'completed';
    cycle.completedAt = now;
    const activity = await Activity.findOne({ activityId: cycle.activityId });
    if (activity && user) {
      await awardCompletionRewards(user, activity, cycle);
    }
    await cycle.save();
  } else if (isPastEndDate) {
    cycle.status = 'expired';
    cycle.expiredAt = now;
    await cycle.save();
  }

  return cycle;
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

    const activities = await Activity.find(query).sort({ category: 1, durationDays: -1 });

    // If user is authenticated, attach cycle statuses
    let userCycles = [];
    let dismissedSet = new Set();
    if (req.user) {
      userCycles = await UserActivityCycle.find({ userId: req.user._id });
      const dismissed = await UserDismissedActivity.find({ userId: req.user._id });
      dismissedSet = new Set(dismissed.map((d) => d.activityId));
    }

    const todayStr = getCalendarDateString();

    const formatted = activities.map((act) => {
      const actObj = act.toObject();
      const cyclesForAct = userCycles.filter((c) => c.activityId === act.activityId);
      const activeCycle = cyclesForAct.find((c) => c.status === 'active');
      const latestCompleted = cyclesForAct
        .filter((c) => c.status === 'completed')
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
      const latestExpired = cyclesForAct
        .filter((c) => c.status === 'expired')
        .sort((a, b) => new Date(b.expiredAt) - new Date(a.expiredAt))[0];

      let userStatus = 'available';
      let canRestart = true;
      let restartAvailableDate = null;

      if (activeCycle) {
        userStatus = 'active';
        canRestart = false;
      } else if (latestCompleted) {
        userStatus = 'completed';
        const completedDayStr = getCalendarDateString(latestCompleted.completedAt);
        // Can restart starting the next calendar day
        canRestart = completedDayStr < todayStr && act.isRecurring;
        const nextDay = new Date(latestCompleted.completedAt);
        nextDay.setDate(nextDay.getDate() + 1);
        restartAvailableDate = getCalendarDateString(nextDay);
      } else if (latestExpired) {
        userStatus = 'expired';
        canRestart = true;
      }

      return {
        ...actObj,
        userStatus,
        activeCycle: activeCycle || null,
        canRestart,
        restartAvailableDate,
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

    let activeCycle = null;
    let cyclesHistory = [];
    let isDismissed = false;
    let todayCheckedIn = false;

    if (req.user) {
      cyclesHistory = await UserActivityCycle.find({
        userId: req.user._id,
        activityId,
      }).sort({ createdAt: -1 });

      activeCycle = cyclesHistory.find((c) => c.status === 'active') || null;

      if (activeCycle) {
        await evaluateCycleStatus(activeCycle, req.user);
        const todayStr = getCalendarDateString();
        const checkInToday = await ActivityCheckIn.findOne({
          userActivityCycleId: activeCycle._id,
          checkInDate: todayStr,
        });
        todayCheckedIn = Boolean(checkInToday);
      }

      const dismissed = await UserDismissedActivity.findOne({
        userId: req.user._id,
        activityId,
      });
      isDismissed = Boolean(dismissed);
    }

    const todayStr = getCalendarDateString();
    const latestCompleted = cyclesHistory.find((c) => c.status === 'completed');
    const latestExpired = cyclesHistory.find((c) => c.status === 'expired');

    let userStatus = 'available';
    let canRestart = true;
    let restartAvailableDate = null;

    if (activeCycle && activeCycle.status === 'active') {
      userStatus = 'active';
      canRestart = false;
    } else if (latestCompleted) {
      userStatus = 'completed';
      const completedDayStr = getCalendarDateString(latestCompleted.completedAt);
      canRestart = completedDayStr < todayStr && activity.isRecurring;
      const nextDay = new Date(latestCompleted.completedAt);
      nextDay.setDate(nextDay.getDate() + 1);
      restartAvailableDate = getCalendarDateString(nextDay);
    } else if (latestExpired) {
      userStatus = 'expired';
      canRestart = true;
    }

    const formattedDetail = {
      ...activity.toObject(),
      userStatus,
      activeCycle,
      todayCheckedIn,
      canRestart,
      restartAvailableDate,
      isDismissed,
      historyCount: cyclesHistory.length,
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
// @route   GET /api/v1/users/me/activities/active
// @access  Private
exports.getActiveActivities = async (req, res) => {
  try {
    const rawCycles = await UserActivityCycle.find({
      userId: req.user._id,
      status: 'active',
    }).sort({ createdAt: -1 });

    const todayStr = getCalendarDateString();
    const activeActivities = [];

    for (const cycle of rawCycles) {
      await evaluateCycleStatus(cycle, req.user);

      if (cycle.status === 'active') {
        const activity = await Activity.findOne({ activityId: cycle.activityId });
        const checkInToday = await ActivityCheckIn.findOne({
          userActivityCycleId: cycle._id,
          checkInDate: todayStr,
        });

        // Compute current day of duration
        const startDate = new Date(cycle.startDate);
        const diffMs = new Date() - startDate;
        const currentDayNumber = Math.min(
          cycle.durationDays,
          Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
        );

        activeActivities.push({
          cycle: cycle.toObject(),
          activity: activity ? activity.toObject() : null,
          todayCheckedIn: Boolean(checkInToday),
          todayCheckInRecord: checkInToday || null,
          currentDayNumber,
          remainingDays: Math.max(
            0,
            Math.ceil((new Date(cycle.endDate) - new Date()) / (1000 * 60 * 60 * 24))
          ),
        });
      }
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
// @route   GET /api/v1/users/me/activities/completed
// @access  Private
exports.getCompletedActivities = async (req, res) => {
  try {
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
// @route   GET /api/v1/users/me/activities/expired
// @access  Private
exports.getExpiredActivities = async (req, res) => {
  try {
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
// @route   POST /api/v1/users/me/activities/:activityId/start
// @access  Private
exports.startActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findOne({ activityId, isActive: true });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Check if an active cycle already exists
    const existingActive = await UserActivityCycle.findOne({
      userId: req.user._id,
      activityId,
      status: 'active',
    });

    if (existingActive) {
      await evaluateCycleStatus(existingActive, req.user);
      if (existingActive.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'You already have an active cycle for this activity in progress.',
          cycle: existingActive,
        });
      }
    }

    // Check restart rules if previously completed
    const latestCompleted = await UserActivityCycle.findOne({
      userId: req.user._id,
      activityId,
      status: 'completed',
    }).sort({ completedAt: -1 });

    if (latestCompleted) {
      if (!activity.isRecurring) {
        return res.status(400).json({
          success: false,
          message: 'This one-time activity has already been completed.',
        });
      }

      const todayStr = getCalendarDateString();
      const completedDayStr = getCalendarDateString(latestCompleted.completedAt);

      if (completedDayStr >= todayStr) {
        return res.status(400).json({
          success: false,
          message: 'Challenge completed today! You can restart it starting tomorrow with a fresh cycle.',
        });
      }
    }

    // Determine cycle number
    const totalPrevious = await UserActivityCycle.countDocuments({
      userId: req.user._id,
      activityId,
    });

    const now = new Date();
    const durationDays = activity.durationDays || 7;
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const newCycle = await UserActivityCycle.create({
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
      cycleNumber: totalPrevious + 1,
    });

    // Remove from dismissed if previously dismissed
    await UserDismissedActivity.findOneAndDelete({
      userId: req.user._id,
      activityId,
    });

    res.status(201).json({
      success: true,
      message: `Started "${activity.title}". Welcome to Day 0!`,
      data: newCycle,
      cycle: newCycle,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Action B: Already achieved (✓) for one-time actions
// @route   POST /api/v1/users/me/activities/:activityId/already-achieved
// @access  Private
exports.alreadyAchievedActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findOne({ activityId, isActive: true });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Validation per Section 4: "Do not allow users to instantly complete multi-day habit challenges through this option. A 7-day activity must still satisfy its completion criteria."
    if (activity.activityType === 'daily_habit' && activity.durationDays > 1) {
      return res.status(400).json({
        success: false,
        message: 'Multi-day habit challenges require daily check-in verification and cannot be instantly achieved.',
      });
    }

    // Check if previously completed
    const existingCompleted = await UserActivityCycle.findOne({
      userId: req.user._id,
      activityId,
      status: 'completed',
    });

    if (existingCompleted) {
      return res.status(400).json({
        success: false,
        message: 'This one-time activity has already been confirmed and rewarded previously.',
      });
    }

    // Cancel any stray active cycle
    await UserActivityCycle.updateMany(
      { userId: req.user._id, activityId, status: 'active' },
      { status: 'expired', expiredAt: new Date() }
    );

    const now = new Date();
    const cycle = await UserActivityCycle.create({
      userId: req.user._id,
      activityId,
      activityRef: activity._id,
      status: 'completed',
      startDate: now,
      endDate: now,
      completedAt: now,
      successfulCheckIns: 1,
      totalCheckIns: 1,
      requiredCheckIns: 1,
      durationDays: 1,
      cycleNumber: 1,
    });

    // Record one check-in
    await ActivityCheckIn.create({
      userActivityCycleId: cycle._id,
      userId: req.user._id,
      activityId,
      checkInDate: getCalendarDateString(now),
      completed: true,
      notes: 'Confirmed as already achieved',
    });

    // Award EcoScore & Green Points
    await awardCompletionRewards(req.user, activity, cycle);
    await cycle.save();

    res.status(200).json({
      success: true,
      message: `Verified! +${activity.greenPointsReward} Green Points and +${activity.ecoScoreReward} EcoScore awarded! 🌿`,
      data: {
        cycle,
        pointsEarned: activity.greenPointsReward,
        ecoScoreAwarded: activity.ecoScoreReward,
      },
      cycle,
      rewards: {
        greenPoints: activity.greenPointsReward,
        ecoScore: activity.ecoScoreReward,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Action C: Not for me (×) dismissal
// @route   POST /api/v1/users/me/activities/:activityId/dismiss
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
// @route   POST /api/v1/users/me/activity-cycles/:cycleId/check-ins
// @access  Private
exports.submitDailyCheckIn = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const { completed, checkInDate } = req.body;

    const cycle = await UserActivityCycle.findOne({
      _id: cycleId,
      userId: req.user._id,
    });

    if (!cycle) {
      return res.status(404).json({ success: false, message: 'Active cycle not found' });
    }

    if (cycle.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in: this activity cycle is already ${cycle.status}.`,
      });
    }

    // Check expiration before check-in
    await evaluateCycleStatus(cycle, req.user);
    if (cycle.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This activity cycle duration has ended.',
      });
    }

    // Determine normalized calendar date
    const targetDateStr = checkInDate || getCalendarDateString();
    const todayStr = getCalendarDateString();

    if (targetDateStr > todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Cannot record a check-in for a future date.',
      });
    }

    // Check if check-in for today already exists
    const existingCheckIn = await ActivityCheckIn.findOne({
      userActivityCycleId: cycle._id,
      checkInDate: targetDateStr,
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already recorded your check-in for this activity today.',
        checkIn: existingCheckIn,
      });
    }

    const isYes = completed === true || completed === 'true';

    // Create check-in entry
    const checkIn = await ActivityCheckIn.create({
      userActivityCycleId: cycle._id,
      userId: req.user._id,
      activityId: cycle.activityId,
      checkInDate: targetDateStr,
      completed: isYes,
    });

    // Update cycle counters
    cycle.totalCheckIns += 1;
    if (isYes) {
      cycle.successfulCheckIns += 1;
    }

    let justCompleted = false;
    let earnedRewards = null;

    // Check if completion criteria met
    if (cycle.successfulCheckIns >= cycle.requiredCheckIns) {
      cycle.status = 'completed';
      cycle.completedAt = new Date();
      justCompleted = true;

      const activity = await Activity.findOne({ activityId: cycle.activityId });
      if (activity) {
        await awardCompletionRewards(req.user, activity, cycle);
        earnedRewards = {
          ecoScore: activity.ecoScoreReward,
          greenPoints: activity.greenPointsReward,
        };
      }
    }

    await cycle.save();

    res.status(200).json({
      success: true,
      message: justCompleted
        ? `🎉 Goal Achieved! Challenge completed with ${cycle.successfulCheckIns}/${cycle.requiredCheckIns} successful check-ins!`
        : isYes
        ? 'Great job! Check-in recorded for today. 🌿'
        : 'Noted. Keep going, tomorrow is a new opportunity!',
      data: {
        checkIn,
        cycle,
        justCompleted,
        rewards: earnedRewards,
      },
      checkIn,
      cycle,
      justCompleted,
      rewards: earnedRewards,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already recorded your check-in for this activity today.',
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single cycle details with its full check-in history
// @route   GET /api/v1/users/me/activity-cycles/:cycleId
// @access  Private
exports.getCycleDetails = async (req, res) => {
  try {
    const { cycleId } = req.params;
    const cycle = await UserActivityCycle.findOne({
      _id: cycleId,
      userId: req.user._id,
    });

    if (!cycle) {
      return res.status(404).json({ success: false, message: 'Activity cycle not found' });
    }

    await evaluateCycleStatus(cycle, req.user);

    const activity = await Activity.findOne({ activityId: cycle.activityId });
    const checkIns = await ActivityCheckIn.find({
      userActivityCycleId: cycle._id,
    }).sort({ checkInDate: 1 });

    const todayStr = getCalendarDateString();
    const todayCheckIn = checkIns.find((c) => c.checkInDate === todayStr);

    res.status(200).json({
      success: true,
      cycle,
      activity,
      checkIns,
      todayCheckedIn: Boolean(todayCheckIn),
      todayCheckInRecord: todayCheckIn || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
