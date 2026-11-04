import { request } from '../../services/api';
import { ACTIVITY_CATALOG } from '../../activities/activityCatalog';
import { getQuestionnaire } from '../../activities/questionnaires';
import { generatePersonalizedPlan } from '../../activities/recommendationEngine';

// Full 59 Mission LiFE activities catalog
export const FALLBACK_ACTIVITIES = ACTIVITY_CATALOG.map((a) => ({
  ...a,
  id: a.activityId,
}));

const likedIds = new Set(['energy_switch_off_unused']);
const inMemoryActiveCycles = new Map();
const inMemoryCompleted = new Set();
const inMemoryDismissed = new Set();

// 4 Sustainability Categories
const DEFAULT_CATEGORIES = [
  {
    id: 'energy',
    name: 'Energy Conservation',
    titleKey: 'cat_energy_name',
    descKey: 'cat_energy_desc',
    description: 'Optimize power consumption and adopt renewable solutions.',
    totalActivities: FALLBACK_ACTIVITIES.filter((a) => a.category === 'energy').length,
    activeCount: 0,
    icon: '⚡',
    color: '#D97706',
  },
  {
    id: 'transport',
    name: 'Sustainable Transportation',
    titleKey: 'cat_transport_name',
    descKey: 'cat_transport_desc',
    description: 'Promote active transit, public mobility and shared commuting.',
    totalActivities: FALLBACK_ACTIVITIES.filter((a) => a.category === 'transport').length,
    activeCount: 0,
    icon: '🚲',
    color: '#0284C7',
  },
  {
    id: 'waste',
    name: 'Waste Management',
    titleKey: 'cat_waste_name',
    descKey: 'cat_waste_desc',
    description: 'Segregate at source, compost organics and eliminate plastics.',
    totalActivities: FALLBACK_ACTIVITIES.filter((a) => a.category === 'waste').length,
    activeCount: 0,
    icon: '♻️',
    color: '#16A34A',
  },
  {
    id: 'water',
    name: 'Water Conservation',
    titleKey: 'cat_water_name',
    descKey: 'cat_water_desc',
    description: 'Prevent leakage, install aerators and harvest rainwater.',
    totalActivities: FALLBACK_ACTIVITIES.filter((a) => a.category === 'water').length,
    activeCount: 0,
    icon: '💧',
    color: '#2563EB',
  },
];

// Fetch 4 sustainability categories with activity counts and active challenges count
export const fetchCategories = async () => {
  try {
    const res = await request('/activities/categories');
    const categories = res.data || res.categories;
    if (Array.isArray(categories) && categories.length > 0) {
      return categories.map((cat) => ({
        ...cat,
        activeCount: cat.activeActivities ?? cat.activeCount ?? 0,
      }));
    }
  } catch (error) {
    console.warn('fetchCategories API error, fallback to static:', error.message);
  }

  // Fallback with live local active counts
  return DEFAULT_CATEGORIES.map((cat) => {
    let activeInCat = 0;
    for (const [actId] of inMemoryActiveCycles.entries()) {
      const act = FALLBACK_ACTIVITIES.find((a) => a.activityId === actId);
      if (act && act.category === cat.id) activeInCat++;
    }
    return {
      ...cat,
      activeCount: activeInCat,
    };
  });
};

// Fetch activities by category with automatic robust fallback
export const fetchActivitiesByCategory = async (category) => {
  try {
    const query = category ? `?category=${category}` : '';
    const res = await request(`/activities${query}`);
    const list = res.data || res.activities;
    if (Array.isArray(list) && list.length > 0) {
      return list.map((item) => {
        const actId = item.activityId || item.id;
        if (inMemoryActiveCycles.has(actId) && (!item.userStatus || item.userStatus === 'available')) {
          return {
            ...item,
            userStatus: 'active',
            activeCycle: inMemoryActiveCycles.get(actId),
          };
        }
        if (inMemoryCompleted.has(actId) && (!item.userStatus || item.userStatus === 'available')) {
          return {
            ...item,
            userStatus: 'completed',
          };
        }
        return item;
      });
    }
  } catch (err) {
    console.warn(`fetchActivitiesByCategory (${category}) backend error, using catalog fallback:`, err.message);
  }

  // Fallback to embedded activities catalog
  const filtered = category
    ? FALLBACK_ACTIVITIES.filter((a) => a.category === category)
    : FALLBACK_ACTIVITIES;

  return filtered.map((act) => {
    const actId = act.activityId || act.id;
    let userStatus = 'available';
    let activeCycle = null;

    if (inMemoryActiveCycles.has(actId)) {
      userStatus = 'active';
      activeCycle = inMemoryActiveCycles.get(actId);
    } else if (inMemoryCompleted.has(actId)) {
      userStatus = 'completed';
    }

    return {
      ...act,
      userStatus,
      activeCycle,
      isDismissed: inMemoryDismissed.has(actId),
    };
  });
};

// Fetch full details of an activity including user's active/completed status
export const fetchActivityDetail = async (activityId) => {
  try {
    const res = await request(`/activities/${activityId}`);
    const raw = res.data || res.activity;
    if (raw) {
      const actId = raw.activityId || raw.id || activityId;
      if (inMemoryActiveCycles.has(actId) && (!raw.userStatus || raw.userStatus === 'available')) {
        return {
          ...raw,
          userStatus: 'active',
          activeCycle: inMemoryActiveCycles.get(actId),
        };
      }
      if (inMemoryCompleted.has(actId) && (!raw.userStatus || raw.userStatus === 'available')) {
        return {
          ...raw,
          userStatus: 'completed',
        };
      }
      return raw;
    }
  } catch (err) {
    console.warn(`fetchActivityDetail (${activityId}) error, using fallback:`, err.message);
  }

  const act =
    FALLBACK_ACTIVITIES.find(
      (a) => a.activityId === activityId || a.id === activityId
    ) || FALLBACK_ACTIVITIES[0];

  const actId = act.activityId || act.id;
  let userStatus = 'available';
  let activeCycle = null;

  if (inMemoryActiveCycles.has(actId)) {
    userStatus = 'active';
    activeCycle = inMemoryActiveCycles.get(actId);
  } else if (inMemoryCompleted.has(actId)) {
    userStatus = 'completed';
  }

  return {
    ...act,
    userStatus,
    activeCycle,
    isDismissed: inMemoryDismissed.has(actId),
    canRestart: userStatus === 'completed' && act.isRecurring,
  };
};

// Fetch user's currently active challenge cycles
export const fetchActiveActivities = async () => {
  try {
    const res = await request('/activities/users/me/active');
    const list = res.data || res.activeActivities;
    if (Array.isArray(list)) {
      return list;
    }
  } catch (error) {
    console.warn('fetchActiveActivities error, using fallback:', error.message);
  }

  return Array.from(inMemoryActiveCycles.values());
};

// Fetch completed activities
export const fetchCompletedActivities = async () => {
  try {
    const res = await request('/activities/users/me/completed');
    const list = res.data || res.completedActivities;
    if (Array.isArray(list)) {
      return list;
    }
  } catch (error) {
    console.warn('fetchCompletedActivities error:', error.message);
  }

  return Array.from(inMemoryCompleted).map((id) => {
    const act = FALLBACK_ACTIVITIES.find((a) => a.activityId === id);
    const duration = act?.durationDays || 7;
    const req = act?.requiredCheckIns || 5;
    return {
      cycle: {
        _id: `completed_${id}`,
        activityId: id,
        status: 'completed',
        totalDurationDays: duration,
        successfulCheckIns: req,
        requiredCheckIns: req,
        completedAt: new Date(),
        ecoScoreAwarded: act?.ecoScoreReward || 5,
        greenPointsAwarded: act?.greenPointsReward || 25,
        carbonSavedKgCO2e: act?.carbonSavingKgCO2e || 0.5,
      },
      activity: act,
    };
  });
};

// Fetch expired activities
export const fetchExpiredActivities = async () => {
  try {
    const res = await request('/activities/users/me/expired');
    const list = res.data || res.expiredActivities;
    if (Array.isArray(list)) {
      return list;
    }
  } catch (error) {
    console.warn('fetchExpiredActivities error:', error.message);
  }

  return [];
};

// Fetch activity questionnaire for personalized assessment
export const fetchQuestionnaire = async (activityId) => {
  try {
    const res = await request(`/activities/${activityId}/questionnaire`);
    if (res.data || res.questionnaire) {
      return res.data || res.questionnaire;
    }
  } catch (err) {
    console.warn(`fetchQuestionnaire (${activityId}) error, using fallback:`, err.message);
  }
  return getQuestionnaire(activityId);
};

// Assess user answers and generate personalized plan
export const assessActivity = async (activityId, responses) => {
  try {
    const res = await request(`/activities/users/me/${activityId}/assess`, {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });
    if (res.data || res.plan) {
      return res.data || res.plan;
    }
  } catch (err) {
    console.warn(`assessActivity (${activityId}) API error, using local engine:`, err.message);
  }
  return generatePersonalizedPlan(activityId, responses);
};

// Action A: Add to my goals / start challenge (supports optional assessment responses)
export const startActivity = async (activityId, responses = null) => {
  // Check local in-memory session duplicate enrollment
  if (inMemoryActiveCycles.has(activityId)) {
    const error = new Error('Activity is already active in your goals!');
    error.status = 400;
    throw error;
  }
  if (inMemoryCompleted.has(activityId)) {
    const error = new Error('You have already completed this activity today! You can restart tomorrow.');
    error.status = 400;
    throw error;
  }

  try {
    const res = await request(`/activities/users/me/${activityId}/start`, {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });
    return res.data || res.cycle;
  } catch (err) {
    // If backend rejected with duplicate or business logic error, propagate!
    if (err.status && err.status >= 400 && err.status < 500 && err.status !== 401) {
      throw err;
    }
    console.warn('startActivity API error, storing in local session:', err.message);
  }

  const act = FALLBACK_ACTIVITIES.find(
    (a) => a.activityId === activityId || a.id === activityId
  );
  const now = new Date();
  const duration = act?.durationDays || 7;

  let plan = null;
  if (responses && Object.keys(responses).length > 0) {
    plan = generatePersonalizedPlan(activityId, responses);
  }

  const cycle = {
    _id: `cycle_${Date.now()}`,
    activityId: act,
    activityCode: activityId,
    status: 'active',
    startDate: now,
    endDate: new Date(now.getTime() + duration * 24 * 60 * 60 * 1000),
    totalDurationDays: duration,
    currentDayIndex: 0,
    successfulCheckIns: 0,
    requiredCheckIns: act?.requiredCheckIns || 6,
    hasCheckedInToday: false,
    isPersonalized: Boolean(plan),
    baselineResponses: responses || {},
    currentUsage: plan?.currentUsage || null,
    recommendedTarget: plan?.recommendedTarget || null,
    recommendedReduction: plan?.recommendedReduction || null,
    resourceSavings: plan?.resourceSavings || null,
    dailyPlan: plan?.dailyPlan || [],
    todayPlanAction: plan?.dailyPlan?.[0]?.action || '',
    calculationMetadata: plan ? {
      carbonSavingsKgCO2e: plan.carbonSavings?.totalCycleKgCO2e || plan.carbonSavings?.perDayKgCO2e || plan.carbonSavingsKgCO2e || 0,
      carbonSavings: plan.carbonSavings,
      calculationMethod: plan.carbonSavings?.formula || plan.calculationMethod,
      emissionFactor: plan.carbonSavings?.emissionFactor || plan.emissionFactor,
      assumptions: plan.carbonSavings?.assumptions || plan.assumptions,
    } : null,
  };
  inMemoryActiveCycles.set(activityId, cycle);
  inMemoryDismissed.delete(activityId);
  return cycle;
};

// Action B: Already achieved (✓)
export const alreadyAchievedActivity = async (activityId) => {
  try {
    const res = await request(`/activities/users/me/${activityId}/already-achieved`, {
      method: 'POST',
    });
    return res.data || res;
  } catch (err) {
    console.warn('alreadyAchievedActivity API error, storing locally:', err.message);
  }

  const act = FALLBACK_ACTIVITIES.find(
    (a) => a.activityId === activityId || a.id === activityId
  );
  inMemoryActiveCycles.delete(activityId);
  inMemoryCompleted.add(activityId);
  return {
    activityId,
    pointsEarned: act?.greenPointsReward || 25,
    ecoScoreAwarded: act?.ecoScoreReward || 5,
  };
};

// Action C: Not for me (×)
export const dismissActivity = async (activityId) => {
  try {
    const res = await request(`/activities/users/me/${activityId}/dismiss`, {
      method: 'POST',
    });
    return res.data || res;
  } catch (err) {
    console.warn('dismissActivity API error, storing locally:', err.message);
  }

  inMemoryDismissed.add(activityId);
  inMemoryActiveCycles.delete(activityId);
  return { activityId };
};

// Submit daily check-in
export const submitDailyCheckIn = async ({ cycleId, completed, checkInDate }) => {
  try {
    const res = await request(`/activities/users/me/cycles/${cycleId}/check-ins`, {
      method: 'POST',
      body: JSON.stringify({ completed, checkInDate }),
    });
    return res.data || res;
  } catch (err) {
    console.warn('submitDailyCheckIn API error, updating local cycle:', err.message);
  }

  // Update in memory cycle
  for (const [actId, cycle] of inMemoryActiveCycles.entries()) {
    if (cycle._id === cycleId || actId === cycleId || cycle.activityCode === cycleId) {
      cycle.hasCheckedInToday = true;
      if (completed) {
        cycle.successfulCheckIns += 1;
      }
      let justCompleted = false;
      if (cycle.successfulCheckIns >= cycle.requiredCheckIns) {
        cycle.isRewardQualified = true;
        inMemoryCompleted.add(actId);
        justCompleted = true;
      }
      if (cycle.successfulCheckIns >= (cycle.totalDurationDays || 7)) {
        cycle.status = 'completed';
        cycle.isCompleted = true;
        inMemoryActiveCycles.delete(actId);
      }
      return { cycle, justCompleted, checkIn: { completed, checkInDate: new Date() } };
    }
  }

  return { success: true };
};

// Fetch specific cycle details
export const fetchCycleDetails = async (cycleId) => {
  try {
    const res = await request(`/activities/users/me/cycles/${cycleId}`);
    return res.data;
  } catch {
    return null;
  }
};

// Liked activities storage helpers
export const fetchLikedActivities = async () => {
  return FALLBACK_ACTIVITIES.filter((item) => likedIds.has(item.activityId || item.id));
};

export const toggleLikeActivity = async (activityId) => {
  let liked = false;
  if (likedIds.has(activityId)) {
    likedIds.delete(activityId);
  } else {
    likedIds.add(activityId);
    liked = true;
  }
  return { activityId, liked };
};

export const fetchHiddenActivities = async () => {
  return [];
};

export const toggleHideActivity = async (id) => {
  return { id, hidden: false };
};
