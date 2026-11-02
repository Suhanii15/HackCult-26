import { request } from '../../services/api';

// Comprehensive 13 official Mission LiFE activities catalog
export const FALLBACK_ACTIVITIES = [
  // 1. Energy Conservation
  {
    activityId: 'energy_switch_off_unused',
    id: 'energy_switch_off_unused',
    title: 'Switch off unused appliances',
    titleKey: 'activity_energy_switch_off_unused_title',
    description: 'Ensure appliances, chargers, and entertainment devices are completely turned off when not in active use.',
    whyItMatters: 'Vampire loads consume 5-10% of total residential electricity in Gujarat, creating continuous avoidable grid emissions.',
    instructions: 'Turn off televisions, set-top boxes, computer monitors, and phone chargers at the wall plug switch every night.',
    completionCriteria: 'Check in on at least 6 out of 7 consecutive days confirming all unused electronics were switched off.',
    category: 'energy',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 6,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
  },
  {
    activityId: 'energy_reduce_ac',
    id: 'energy_reduce_ac',
    title: 'Reduce unnecessary AC usage',
    titleKey: 'activity_energy_reduce_ac_title',
    description: 'Set your air conditioner to 24°C or higher and complement it with a ceiling fan for optimal cooling.',
    whyItMatters: 'Every 1°C increase on an air conditioner thermostat saves approximately 6% of compressor energy consumption.',
    instructions: 'Keep AC thermostat at 24°C-26°C with ceiling fan on medium speed. Turn off when leaving the room for >15 minutes.',
    completionCriteria: 'Check in on at least 5 out of 7 consecutive days maintaining AC temperature at 24°C or above.',
    category: 'energy',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 5,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
  },
  {
    activityId: 'energy_switch_off_lights',
    id: 'energy_switch_off_lights',
    title: 'Switch off lights when leaving rooms',
    titleKey: 'activity_energy_switch_off_lights_title',
    description: 'Make it a conscious habit to turn off all ambient lighting and fans when stepping out of rooms.',
    whyItMatters: 'Lighting accounts for nearly 12% of typical Indian residential bills and unnecessary illumination adds ambient heat.',
    instructions: 'Check lighting switches before exiting bedrooms, kitchens, and living rooms throughout the day.',
    completionCriteria: 'Check in on at least 6 out of 7 consecutive days confirming zero lights were left running in vacant rooms.',
    category: 'energy',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 6,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
  },
  {
    activityId: 'energy_replace_led',
    id: 'energy_replace_led',
    title: 'Replace conventional bulbs with LED bulbs',
    titleKey: 'activity_energy_replace_led_title',
    description: 'Upgrade existing incandescent or CFL lighting fixtures to energy-efficient BEE 5-Star rated LEDs.',
    whyItMatters: 'LED bulbs use 80% less power than traditional incandescent bulbs and emit negligible thermal radiation.',
    instructions: 'Identify any old incandescent or high-wattage CFL bulbs at home and replace them with 9W/12W LED bulbs.',
    completionCriteria: 'Confirm that all primary light sockets in your household are upgraded to LED technology.',
    category: 'energy',
    activityType: 'one_time',
    durationDays: 1,
    requiredCheckIns: 1,
    ecoScoreReward: 5,
    greenPointsReward: 30,
    isRecurring: false,
  },

  // 2. Sustainable Transportation
  {
    activityId: 'transport_walk_cycle',
    id: 'transport_walk_cycle',
    title: 'Walk or cycle for short distances',
    titleKey: 'activity_transport_walk_cycle_title',
    description: 'Replace motorbike or car trips under 1.5 km with walking or bicycling for neighborhood errands.',
    whyItMatters: 'Short motor trips run on cold engines, producing up to 3x higher emissions per kilometer and burning expensive fuel.',
    instructions: 'Choose walking or cycling for neighborhood grocery runs, milk pickup, or temple visits.',
    completionCriteria: 'Record at least 5 walking or cycling trips out of 7 days for local neighbourhood errands.',
    category: 'transport',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 5,
    ecoScoreReward: 5,
    greenPointsReward: 25,
    isRecurring: true,
  },
  {
    activityId: 'transport_public_transit',
    id: 'transport_public_transit',
    title: 'Use public transportation',
    titleKey: 'activity_transport_public_transit_title',
    description: 'Use public transit such as Ahmedabad BRTS, Metro, AMTS or local buses for your daily commute.',
    whyItMatters: 'A fully occupied city bus displaces over 40 personal motor vehicles from congested roads and cuts tailpipe CO₂ by 70%.',
    instructions: 'Take the bus, metro, or shared transit for at least one leg of your commute during the challenge period.',
    completionCriteria: 'Check in on at least 5 out of 7 days using public transit or shared mass transit for your commute.',
    category: 'transport',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 5,
    ecoScoreReward: 5,
    greenPointsReward: 25,
    isRecurring: true,
  },
  {
    activityId: 'transport_carpool',
    id: 'transport_carpool',
    title: 'Carpool whenever possible',
    titleKey: 'activity_transport_carpool_title',
    description: 'Share rides with colleagues, neighbors, or classmates traveling in the same direction.',
    whyItMatters: 'Carpooling cuts per-capita commute fuel costs and vehicular carbon footprint in half.',
    instructions: 'Coordinate shared rides with co-workers or friends instead of driving solo.',
    completionCriteria: 'Check in on at least 4 out of 7 days having shared a commute or group ride.',
    category: 'transport',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 4,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
  },

  // 3. Waste Management
  {
    activityId: 'waste_segregate',
    id: 'waste_segregate',
    title: 'Segregate wet and dry waste',
    titleKey: 'activity_waste_segregate_title',
    description: 'Maintain separate bins for organic kitchen waste (green bin) and recyclable dry packaging (blue bin).',
    whyItMatters: 'Unsegregated waste decomposing in municipal dumps emits potent methane and contaminates recyclable materials.',
    instructions: 'Place vegetable peels and food scraps in the wet bin; paper, plastics, and cardboard in the dry bin.',
    completionCriteria: 'Check in on at least 6 out of 7 days having handed over segregated wet and dry waste to collection vans.',
    category: 'waste',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 6,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
  },
  {
    activityId: 'waste_avoid_single_plastic',
    id: 'waste_avoid_single_plastic',
    title: 'Avoid single-use plastic',
    titleKey: 'activity_waste_avoid_single_plastic_title',
    description: 'Refuse single-use plastic bags, disposable cutlery, and plastic straw wrappers when buying food or groceries.',
    whyItMatters: 'Single-use plastic persists in Gujarat drainage systems and rivers for centuries, breaking down into toxic microplastics.',
    instructions: 'Carry cloth bags when shopping and politely ask vendors to skip disposable plastic wrap and bags.',
    completionCriteria: 'Check in on at least 5 out of 7 days achieving a 100% single-use plastic free day.',
    category: 'waste',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 5,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
  },
  {
    activityId: 'waste_reusable_bottle',
    id: 'waste_reusable_bottle',
    title: 'Carry a reusable water bottle',
    titleKey: 'activity_waste_reusable_bottle_title',
    description: 'Bring a personal stainless steel or copper water bottle with you when stepping out of the house.',
    whyItMatters: 'Eliminates reliance on commercially packaged PET water bottles that generate recurring plastic waste.',
    instructions: 'Fill up your reusable flask before leaving home and refill at trusted water stations or office dispensers.',
    completionCriteria: 'Check in on at least 6 out of 7 days carrying your personal reusable water container.',
    category: 'waste',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 6,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
  },

  // 4. Water Conservation
  {
    activityId: 'water_turn_off_tap_brushing',
    id: 'water_turn_off_tap_brushing',
    title: 'Turn off taps while brushing',
    titleKey: 'activity_water_turn_off_tap_brushing_title',
    description: 'Shut the bathroom washbasin faucet tightly while brushing teeth or shaving instead of letting water run.',
    whyItMatters: 'A running washbasin tap wastes up to 6 liters of treated drinking water per minute.',
    instructions: 'Only open the tap when rinsing your mouth or toothbrush. Use a tumbler if preferred.',
    completionCriteria: 'Check in on at least 6 out of 7 days keeping the tap closed while brushing.',
    category: 'water',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 6,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
  },
  {
    activityId: 'water_reduce_shower_duration',
    id: 'water_reduce_shower_duration',
    title: 'Reduce shower duration',
    titleKey: 'activity_water_reduce_shower_duration_title',
    description: 'Cap your bathing shower to 4-5 minutes, or use a traditional bucket and mug for efficient bathing.',
    whyItMatters: 'Conventional overhead showers dispense 12-15 liters per minute. Bucket baths use just 15-20 liters total.',
    instructions: 'Time your shower to under 5 minutes or use a standard 18-liter bathing bucket.',
    completionCriteria: 'Check in on at least 5 out of 7 days bathing within 5 minutes or with a single bucket.',
    category: 'water',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 5,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
  },
  {
    activityId: 'water_report_leaking_taps',
    id: 'water_report_leaking_taps',
    title: 'Report or repair leaking taps',
    titleKey: 'activity_water_report_leaking_taps_title',
    description: 'Fix or report any dripping faucets, shower heads, or toilet flush valves in your home or society.',
    whyItMatters: 'A single dripping tap leaking one drop per second squanders over 3,000 liters of potable water every year.',
    instructions: 'Inspect all home plumbing fixtures, replace worn-out washers, or report leaks to maintenance.',
    completionCriteria: 'Confirm that all dripping taps in your household or workplace have been inspected and repaired.',
    category: 'water',
    activityType: 'one_time',
    durationDays: 1,
    requiredCheckIns: 1,
    ecoScoreReward: 5,
    greenPointsReward: 25,
    isRecurring: false,
  },
];

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
    totalActivities: 4,
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
    totalActivities: 3,
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
    totalActivities: 3,
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
    totalActivities: 3,
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
      return list;
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
    if (res.data || res.activity) {
      return res.data || res.activity;
    }
  } catch (err) {
    console.warn(`fetchActivityDetail (${activityId}) error, using fallback:`, err.message);
  }

  const act = FALLBACK_ACTIVITIES.find(
    (a) => a.activityId === activityId || a.id === activityId
  );
  if (!act) throw new Error('Activity not found');

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
    return { activity: act, completedAt: new Date() };
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

// Action A: Add to my goals (+)
export const startActivity = async (activityId) => {
  try {
    const res = await request(`/activities/users/me/${activityId}/start`, {
      method: 'POST',
    });
    return res.data || res.cycle;
  } catch (err) {
    console.warn('startActivity API error, storing in local session:', err.message);
  }

  const act = FALLBACK_ACTIVITIES.find(
    (a) => a.activityId === activityId || a.id === activityId
  );
  const now = new Date();
  const duration = act?.durationDays || 7;
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
    if (cycle._id === cycleId) {
      cycle.hasCheckedInToday = true;
      if (completed) {
        cycle.successfulCheckIns += 1;
      }
      if (cycle.successfulCheckIns >= cycle.requiredCheckIns) {
        cycle.status = 'completed';
        cycle.isCompleted = true;
        inMemoryCompleted.add(actId);
        inMemoryActiveCycles.delete(actId);
      }
      return { cycle, checkIn: { completed, checkInDate: new Date() } };
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
