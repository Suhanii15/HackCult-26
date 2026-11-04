const User = require('../models/User');

// Helper to extract initials
const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (name[0] || 'C').toUpperCase();
};

// @desc    Get multi-scope leaderboard rankings
// @route   GET /api/v1/points/leaderboard
// @access  Private / Public (optional auth)
exports.getLeaderboard = async (req, res, next) => {
  try {
    const scope = req.query.scope || 'district'; // 'area' | 'district' | 'state'
    const metric = req.query.metric || 'green'; // 'green' | 'eco' | 'carbon'

    // Determine location context from authenticated user or defaults
    const user = req.user || {};
    const userCity = user.city || 'Vastrapur';
    const userDistrict = user.district || 'Ahmedabad';
    const userState = user.state || 'Gujarat';
    const currentUserId = user._id ? user._id.toString() : null;

    // Build filter based on scope
    const filter = {};
    let scopeLabel = '';

    if (scope === 'area') {
      filter.city = userCity;
      scopeLabel = `${userCity} Ward / Area`;
    } else if (scope === 'state') {
      filter.state = userState;
      scopeLabel = `${userState} State`;
    } else {
      // default: district
      filter.district = userDistrict;
      scopeLabel = `${userDistrict} District`;
    }

    // Determine sorting criteria & value mapping
    let sortObj = {};
    let scoreField = '';
    let scoreUnit = '';

    if (metric === 'eco') {
      sortObj = { 'ecoScore.total': -1, currentStreakDays: -1, totalPoints: -1 };
      scoreField = 'ecoScore';
      scoreUnit = 'Eco';
    } else if (metric === 'carbon') {
      // Lowest footprint ranks highest (greater than 0)
      filter.baselineAnnualCO2Kg = { $gt: 0 };
      sortObj = { baselineAnnualCO2Kg: 1, totalPoints: -1 };
      scoreField = 'baselineAnnualCO2Kg';
      scoreUnit = 'kg CO₂/yr';
    } else {
      // Default: Green Score (points)
      sortObj = { totalPoints: -1, currentStreakDays: -1, createdAt: 1 };
      scoreField = 'totalPoints';
      scoreUnit = 'pts';
    }

    // Query matching users
    const allMatching = await User.find(
      filter,
      'fullName email city district state totalPoints ecoScore baselineAnnualCO2Kg currentStreakDays badgesEarned'
    ).sort(sortObj).limit(100);

    // If fewer than 5 users found in local area, fallback to district for richer experience
    let candidateList = allMatching;
    if (scope === 'area' && candidateList.length < 3) {
      candidateList = await User.find(
        { district: userDistrict },
        'fullName email city district state totalPoints ecoScore baselineAnnualCO2Kg currentStreakDays badgesEarned'
      ).sort(sortObj).limit(100);
      scopeLabel = `${userDistrict} (Expanded)`;
    }

    // Map candidates to formatted leaderboard entries
    const mappedEntries = candidateList.map((u, idx) => {
      let rawScore = 0;
      let displayScore = '0';

      if (metric === 'eco') {
        rawScore = typeof u.ecoScore === 'number' ? u.ecoScore : (u.ecoScore?.total || 72);
        displayScore = `${rawScore}`;
      } else if (metric === 'carbon') {
        rawScore = u.baselineAnnualCO2Kg || 2500;
        displayScore = rawScore >= 1000 ? `${(rawScore / 1000).toFixed(1)} t` : `${rawScore} kg`;
      } else {
        rawScore = u.totalPoints || 50;
        displayScore = rawScore.toLocaleString();
      }

      const isCurrent = currentUserId && u._id.toString() === currentUserId;

      return {
        rank: idx + 1,
        id: u._id,
        name: isCurrent ? `${u.fullName} (You)` : u.fullName,
        city: u.city || 'Gujarat',
        district: u.district || 'Ahmedabad',
        state: u.state || 'Gujarat',
        streak: u.currentStreakDays || 1,
        score: rawScore,
        displayScore,
        scoreUnit,
        initials: getInitials(u.fullName),
        badgesCount: u.badgesEarned ? u.badgesEarned.length : 0,
        isCurrentUser: Boolean(isCurrent),
      };
    });

    // Top 10 list
    const top10 = mappedEntries.slice(0, 10);

    // Identify current user ranking
    let currentUserEntry = mappedEntries.find((e) => e.isCurrentUser);

    // If current user is not in matching list, create synthetic position
    if (!currentUserEntry && user._id) {
      const myRawScore =
        metric === 'eco'
          ? (typeof user.ecoScore === 'number' ? user.ecoScore : (user.ecoScore?.total || 72))
          : metric === 'carbon'
          ? user.baselineAnnualCO2Kg || 2500
          : user.totalPoints || 50;

      currentUserEntry = {
        rank: mappedEntries.length + 1,
        id: user._id,
        name: `${user.fullName} (You)`,
        city: user.city || userCity,
        district: user.district || userDistrict,
        state: user.state || userState,
        streak: user.currentStreakDays || 1,
        score: myRawScore,
        displayScore:
          metric === 'carbon' && myRawScore >= 1000
            ? `${(myRawScore / 1000).toFixed(1)} t`
            : `${myRawScore}`,
        scoreUnit,
        initials: getInitials(user.fullName),
        badgesCount: user.badgesEarned ? user.badgesEarned.length : 0,
        isCurrentUser: true,
      };
    }

    // Points / gap to next rank
    let gapToNextRank = null;
    if (currentUserEntry && currentUserEntry.rank > 1) {
      const higherUser = mappedEntries[currentUserEntry.rank - 2];
      if (higherUser) {
        gapToNextRank = Math.abs(higherUser.score - currentUserEntry.score);
        if (gapToNextRank === 0) gapToNextRank = 10;
      }
    }

    res.status(200).json({
      success: true,
      scope: {
        type: scope,
        label: scopeLabel,
        city: userCity,
        district: userDistrict,
        state: userState,
      },
      metric: {
        type: metric,
        unit: scoreUnit,
        label:
          metric === 'eco'
            ? '⚡ Eco Rating (0–100)'
            : metric === 'carbon'
            ? '📉 Annual Carbon Footprint'
            : '🌿 Green Points',
      },
      top10,
      currentUser: currentUserEntry
        ? {
            ...currentUserEntry,
            gapToNextRank,
            nextRank: currentUserEntry.rank > 1 ? currentUserEntry.rank - 1 : null,
          }
        : null,
      totalParticipants: mappedEntries.length,
    });
  } catch (err) {
    next(err);
  }
};
