const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DB_FILE_PATH = path.resolve(__dirname, '../.local-db.json');

const DEFAULT_ACTIVITIES = [
  {
    activityId: 'energy_switch_off_unused',
    title: 'Switch off unused appliances',
    titleKey: 'activity_energy_switch_off_unused_title',
    description:
      'Ensure appliances, chargers, and entertainment devices are completely turned off when not in active use.',
    whyItMatters:
      'Vampire loads consume 5-10% of total residential electricity in Gujarat, creating continuous avoidable grid emissions.',
    instructions:
      'Turn off televisions, set-top boxes, computer monitors, and phone chargers at the wall plug switch every night.',
    completionCriteria:
      'Check in on at least 6 out of 7 consecutive days confirming all unused electronics were switched off.',
    category: 'energy',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 6,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
    cooldownDays: 1,
    isActive: true,
  },
  {
    activityId: 'energy_reduce_ac',
    title: 'Reduce unnecessary AC usage',
    titleKey: 'activity_energy_reduce_ac_title',
    description:
      'Set your air conditioner to 24°C or higher and complement it with a ceiling fan for optimal cooling.',
    whyItMatters:
      'Every 1°C increase on an air conditioner thermostat saves approximately 6% of compressor energy consumption.',
    instructions:
      'Keep AC thermostat at 24°C-26°C with ceiling fan on medium speed. Turn off when leaving the room for >15 minutes.',
    completionCriteria:
      'Check in on at least 5 out of 7 consecutive days maintaining AC temperature at 24°C or above.',
    category: 'energy',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 5,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
    cooldownDays: 1,
    isActive: true,
  },
  {
    activityId: 'energy_switch_off_lights',
    title: 'Switch off lights when leaving rooms',
    titleKey: 'activity_energy_switch_off_lights_title',
    description:
      'Make it a conscious habit to turn off all ambient lighting and fans when stepping out of rooms.',
    whyItMatters:
      'Lighting accounts for nearly 12% of typical Indian residential bills and unnecessary illumination adds ambient heat.',
    instructions:
      'Check lighting switches before exiting bedrooms, kitchens, and living rooms throughout the day.',
    completionCriteria:
      'Check in on at least 6 out of 7 consecutive days confirming zero lights were left running in vacant rooms.',
    category: 'energy',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 6,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
    cooldownDays: 1,
    isActive: true,
  },
  {
    activityId: 'energy_replace_led',
    title: 'Replace conventional bulbs with LED bulbs',
    titleKey: 'activity_energy_replace_led_title',
    description:
      'Upgrade existing incandescent or CFL lighting fixtures to energy-efficient BEE 5-Star rated LEDs.',
    whyItMatters:
      'LED bulbs use 80% less power than traditional incandescent bulbs and emit negligible thermal radiation.',
    instructions:
      'Identify any old incandescent or high-wattage CFL bulbs at home and replace them with 9W/12W LED bulbs.',
    completionCriteria:
      'Confirm that all primary light sockets in your household are upgraded to LED technology.',
    category: 'energy',
    activityType: 'one_time',
    durationDays: 1,
    requiredCheckIns: 1,
    ecoScoreReward: 5,
    greenPointsReward: 30,
    isRecurring: false,
    cooldownDays: 0,
    isActive: true,
  },
  {
    activityId: 'transport_walk_cycle',
    title: 'Walk or cycle for short distances',
    titleKey: 'activity_transport_walk_cycle_title',
    description:
      'Replace motorbike or car trips under 1.5 km with walking or bicycling for neighborhood errands.',
    whyItMatters:
      'Short motor trips run on cold engines, producing up to 3x higher emissions per kilometer and burning expensive fuel.',
    instructions:
      'Choose walking or cycling for neighborhood grocery runs, milk pickup, or temple visits.',
    completionCriteria:
      'Record at least 5 walking or cycling trips out of 7 days for local neighbourhood errands.',
    category: 'transport',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 5,
    ecoScoreReward: 5,
    greenPointsReward: 25,
    isRecurring: true,
    cooldownDays: 1,
    isActive: true,
  },
  {
    activityId: 'transport_public_transit',
    title: 'Use public transportation',
    titleKey: 'activity_transport_public_transit_title',
    description:
      'Use public transit such as Ahmedabad BRTS, Metro, AMTS or local buses for your daily commute.',
    whyItMatters:
      'A fully occupied city bus displaces over 40 personal motor vehicles from congested roads and cuts tailpipe CO₂ by 70%.',
    instructions:
      'Take the bus, metro, or shared transit for at least one leg of your commute during the challenge period.',
    completionCriteria:
      'Check in on at least 5 out of 7 days using public transit or shared mass transit for your commute.',
    category: 'transport',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 5,
    ecoScoreReward: 5,
    greenPointsReward: 25,
    isRecurring: true,
    cooldownDays: 1,
    isActive: true,
  },
  {
    activityId: 'transport_carpool',
    title: 'Carpool whenever possible',
    titleKey: 'activity_transport_carpool_title',
    description:
      'Share rides with colleagues, neighbors, or classmates traveling in the same direction.',
    whyItMatters:
      'Carpooling cuts per-capita commute fuel costs and vehicular carbon footprint in half.',
    instructions: 'Coordinate shared rides with co-workers or friends instead of driving solo.',
    completionCriteria:
      'Check in on at least 4 out of 7 days having shared a commute or group ride.',
    category: 'transport',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 4,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
    cooldownDays: 1,
    isActive: true,
  },
  {
    activityId: 'waste_segregate',
    title: 'Segregate wet and dry waste',
    titleKey: 'activity_waste_segregate_title',
    description:
      'Maintain separate bins for organic kitchen waste (green bin) and recyclable dry packaging (blue bin).',
    whyItMatters:
      'Unsegregated waste decomposing in municipal dumps emits potent methane and contaminates recyclable materials.',
    instructions:
      'Place vegetable peels and food scraps in the wet bin; paper, plastics, and cardboard in the dry bin.',
    completionCriteria:
      'Check in on at least 6 out of 7 days having handed over segregated wet and dry waste to collection vans.',
    category: 'waste',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 6,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
    cooldownDays: 1,
    isActive: true,
  },
  {
    activityId: 'waste_avoid_single_plastic',
    title: 'Avoid single-use plastic',
    titleKey: 'activity_waste_avoid_single_plastic_title',
    description:
      'Refuse single-use plastic bags, disposable cutlery, and plastic straw wrappers when buying food or groceries.',
    whyItMatters:
      'Single-use plastic persists in Gujarat drainage systems and rivers for centuries, breaking down into toxic microplastics.',
    instructions:
      'Carry cloth bags when shopping and politely ask vendors to skip disposable plastic wrap and bags.',
    completionCriteria:
      'Check in on at least 5 out of 7 days achieving a 100% single-use plastic free day.',
    category: 'waste',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 5,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
    cooldownDays: 1,
    isActive: true,
  },
  {
    activityId: 'waste_reusable_bottle',
    title: 'Carry a reusable water bottle',
    titleKey: 'activity_waste_reusable_bottle_title',
    description:
      'Bring a personal stainless steel or copper water bottle with you when stepping out of the house.',
    whyItMatters:
      'Eliminates reliance on commercially packaged PET water bottles that generate recurring plastic waste.',
    instructions:
      'Fill up your reusable flask before leaving home and refill at trusted water stations or office dispensers.',
    completionCriteria:
      'Check in on at least 6 out of 7 days carrying your personal reusable water container.',
    category: 'waste',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 6,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
    cooldownDays: 1,
    isActive: true,
  },
  {
    activityId: 'water_turn_off_tap_brushing',
    title: 'Turn off taps while brushing',
    titleKey: 'activity_water_turn_off_tap_brushing_title',
    description:
      'Shut the bathroom washbasin faucet tightly while brushing teeth or shaving instead of letting water run.',
    whyItMatters:
      'A running washbasin tap wastes up to 6 liters of treated drinking water per minute.',
    instructions:
      'Only open the tap when rinsing your mouth or toothbrush. Use a tumbler if preferred.',
    completionCriteria:
      'Check in on at least 6 out of 7 days keeping the tap closed while brushing.',
    category: 'water',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 6,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
    cooldownDays: 1,
    isActive: true,
  },
  {
    activityId: 'water_reduce_shower_duration',
    title: 'Reduce shower duration',
    titleKey: 'activity_water_reduce_shower_duration_title',
    description:
      'Cap your bathing shower to 4-5 minutes, or use a traditional bucket and mug for efficient bathing.',
    whyItMatters:
      'Conventional overhead showers dispense 12-15 liters per minute. Bucket baths use just 15-20 liters total.',
    instructions:
      'Time your shower to under 5 minutes or use a standard 18-liter bathing bucket.',
    completionCriteria:
      'Check in on at least 5 out of 7 days bathing within 5 minutes or with a single bucket.',
    category: 'water',
    activityType: 'daily_habit',
    durationDays: 7,
    requiredCheckIns: 5,
    ecoScoreReward: 5,
    greenPointsReward: 20,
    isRecurring: true,
    cooldownDays: 1,
    isActive: true,
  },
  {
    activityId: 'water_report_leaking_taps',
    title: 'Report or repair leaking taps',
    titleKey: 'activity_water_report_leaking_taps_title',
    description:
      'Fix or report any dripping faucets, shower heads, or toilet flush valves in your home or society.',
    whyItMatters:
      'A single dripping tap leaking one drop per second squanders over 3,000 liters of potable water every year.',
    instructions:
      'Inspect all home plumbing fixtures, replace worn-out washers, or report leaks to maintenance.',
    completionCriteria:
      'Confirm that all dripping taps in your household or workplace have been inspected and repaired.',
    category: 'water',
    activityType: 'one_time',
    durationDays: 1,
    requiredCheckIns: 1,
    ecoScoreReward: 5,
    greenPointsReward: 25,
    isRecurring: false,
    cooldownDays: 0,
    isActive: true,
  },
];

const generateId = () => crypto.randomBytes(12).toString('hex');

let store = {
  users: [],
  footprintLogs: [],
  activities: [],
  userActivityCycles: [],
  activityCheckIns: [],
  greenPointTransactions: [],
  ecoScoreTransactions: [],
  userDismissedActivities: [],
};

let isLocalStoreActive = false;

const loadStoreFromDisk = () => {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      store = { ...store, ...parsed };
    }
  } catch (err) {
    console.warn('[LocalStore] Could not read .local-db.json, starting fresh:', err.message);
  }

  if (!Array.isArray(store.activities) || store.activities.length === 0) {
    const now = new Date().toISOString();
    store.activities = DEFAULT_ACTIVITIES.map((act) => ({
      _id: generateId(),
      createdAt: now,
      updatedAt: now,
      ...act,
    }));
    saveStoreToDisk();
  }
};

const saveStoreToDisk = () => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    // Ignore write errors in restricted environments
  }
};

const matchesQuery = (doc, query = {}) => {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, val] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(val)) {
      const anyMatch = val.some((subQuery) => matchesQuery(doc, subQuery));
      if (!anyMatch) return false;
      continue;
    }

    if (val === undefined) continue;

    const docVal = key === 'id' ? doc._id : doc[key];
    if (String(docVal) !== String(val)) {
      return false;
    }
  }
  return true;
};

const applySort = (items, sortSpec) => {
  if (!sortSpec || typeof sortSpec !== 'object') return items;
  const entries = Object.entries(sortSpec);
  if (entries.length === 0) return items;

  return [...items].sort((a, b) => {
    for (const [field, dir] of entries) {
      const direction = dir === -1 || dir === 'desc' ? -1 : 1;
      const va = a[field];
      const vb = b[field];
      if (va === vb) continue;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va < vb) return -1 * direction;
      if (va > vb) return 1 * direction;
    }
    return 0;
  });
};

const isBcryptHash = (str) => typeof str === 'string' && /^\$2[aby]\$\d+\$/.test(str);

const wrapDocument = (collectionKey, rawDoc, options = {}) => {
  if (!rawDoc) return null;

  const doc = { ...rawDoc };

  Object.defineProperty(doc, 'toObject', {
    enumerable: false,
    value: function () {
      const clone = { ...this };
      return JSON.parse(JSON.stringify(clone));
    },
  });

  Object.defineProperty(doc, 'save', {
    enumerable: false,
    value: async function () {
      this.updatedAt = new Date().toISOString();
      if (collectionKey === 'users' && this.password && !isBcryptHash(this.password)) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }

      const list = store[collectionKey];
      const idx = list.findIndex((item) => String(item._id) === String(this._id));
      const cleanRecord = JSON.parse(JSON.stringify(this));
      if (this.password) {
        cleanRecord.password = this.password;
      }
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...cleanRecord };
      } else {
        list.push(cleanRecord);
      }
      saveStoreToDisk();
      return this;
    },
  });

  if (collectionKey === 'users') {
    Object.defineProperty(doc, 'matchPassword', {
      enumerable: false,
      value: async function (enteredPassword) {
        const storedRecord = store.users.find((u) => String(u._id) === String(this._id));
        const hash = this.password || storedRecord?.password || '';
        if (!hash) return false;
        if (isBcryptHash(hash)) {
          return await bcrypt.compare(enteredPassword, hash);
        }
        return String(enteredPassword) === String(hash);
      },
    });

    Object.defineProperty(doc, 'getSignedJwtToken', {
      enumerable: false,
      value: function () {
        return jwt.sign(
          { id: this._id, role: this.role || 'citizen' },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );
      },
    });
  }

  return doc;
};

const createChainableQuery = (collectionKey, filter, isSingle = false) => {
  let sortSpec = null;
  let selectSpec = null;

  const execute = async () => {
    const list = store[collectionKey] || [];
    let matched = list.filter((item) => matchesQuery(item, filter));
    if (sortSpec) {
      matched = applySort(matched, sortSpec);
    }
    if (isSingle) {
      const first = matched[0] || null;
      return wrapDocument(collectionKey, first, { selectSpec });
    }
    return matched.map((item) => wrapDocument(collectionKey, item, { selectSpec }));
  };

  const queryObj = {
    sort(spec) {
      sortSpec = spec;
      return queryObj;
    },
    select(spec) {
      selectSpec = spec;
      return queryObj;
    },
    then(onFulfilled, onRejected) {
      return execute().then(onFulfilled, onRejected);
    },
    catch(onRejected) {
      return execute().catch(onRejected);
    },
  };

  return queryObj;
};

const applyDefaultsForCollection = (collectionKey, data) => {
  const now = new Date().toISOString();
  const base = {
    _id: data._id || generateId(),
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
  };

  if (collectionKey === 'users') {
    return {
      ...base,
      fullName: data.fullName || 'Citizen',
      email: (data.email || '').toLowerCase().trim(),
      phone: data.phone,
      password: data.password,
      role: data.role || 'citizen',
      state: data.state || 'Gujarat',
      district: data.district || 'Ahmedabad',
      city: data.city || 'Ahmedabad',
      onboardingCompleted: Boolean(data.onboardingCompleted),
      onboardingMode: data.onboardingMode || 'household',
      household: data.household || {
        size: 4,
        roomShareCount: 1,
        houseType: 'apartment',
        electricity: {
          sourceType: 'kwh',
          kwh: 0,
          amountInINR: 0,
          solar: { hasSolar: false, solarKw: 0, exportedKwh: 0 },
        },
        cooking: { noCookingFuel: false, fuels: [] },
        transport: { noRegularTravel: false, trips: [], walkAlso: false, cycleAlso: false },
        appliances: [],
        habits: {},
      },
      baselineAnnualCO2Kg: data.baselineAnnualCO2Kg ?? 0,
      baselineMonthlyCO2Kg: data.baselineMonthlyCO2Kg ?? 0,
      totalPoints: data.totalPoints ?? 50,
      totalCarbonSavedKg: data.totalCarbonSavedKg ?? 0,
      ecoScore: data.ecoScore || {
        total: 0,
        energy: 0,
        transport: 0,
        waste: 0,
        water: 0,
      },
      currentStreakDays: data.currentStreakDays ?? 1,
      lastActiveDate: data.lastActiveDate || now,
      badgesEarned: data.badgesEarned || [],
      ...data,
    };
  }

  return {
    ...base,
    ...data,
  };
};

const bindModelToCollection = (Model, collectionKey) => {
  Model.find = (filter = {}) => createChainableQuery(collectionKey, filter, false);

  Model.findOne = (filter = {}) => createChainableQuery(collectionKey, filter, true);

  Model.findById = (id) => createChainableQuery(collectionKey, { _id: id }, true);

  Model.countDocuments = async (filter = {}) => {
    const list = store[collectionKey] || [];
    return list.filter((item) => matchesQuery(item, filter)).length;
  };

  Model.create = async (data) => {
    const record = applyDefaultsForCollection(collectionKey, data);
    if (collectionKey === 'users' && record.password && !isBcryptHash(record.password)) {
      const salt = await bcrypt.genSalt(10);
      record.password = await bcrypt.hash(record.password, salt);
    }
    store[collectionKey].push(record);
    saveStoreToDisk();
    return wrapDocument(collectionKey, record);
  };

  Model.findByIdAndUpdate = async (id, update = {}, options = {}) => {
    const list = store[collectionKey] || [];
    const idx = list.findIndex((item) => String(item._id) === String(id));
    if (idx === -1) return null;

    const patch = update.$set ? update.$set : update;
    list[idx] = {
      ...list[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    saveStoreToDisk();
    return wrapDocument(collectionKey, list[idx]);
  };

  Model.findOneAndUpdate = async (filter = {}, update = {}, options = {}) => {
    const list = store[collectionKey] || [];
    const idx = list.findIndex((item) => matchesQuery(item, filter));
    const patch = update.$set ? update.$set : update;

    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      saveStoreToDisk();
      return wrapDocument(collectionKey, list[idx]);
    }

    if (options.upsert) {
      const created = applyDefaultsForCollection(collectionKey, { ...filter, ...patch });
      list.push(created);
      saveStoreToDisk();
      return wrapDocument(collectionKey, created);
    }

    return null;
  };

  Model.findOneAndDelete = async (filter = {}) => {
    const list = store[collectionKey] || [];
    const idx = list.findIndex((item) => matchesQuery(item, filter));
    if (idx === -1) return null;
    const [removed] = list.splice(idx, 1);
    saveStoreToDisk();
    return wrapDocument(collectionKey, removed);
  };

  Model.updateMany = async (filter = {}, update = {}) => {
    const list = store[collectionKey] || [];
    const patch = update.$set ? update.$set : update;
    let modifiedCount = 0;
    for (let i = 0; i < list.length; i++) {
      if (matchesQuery(list[i], filter)) {
        list[i] = {
          ...list[i],
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        modifiedCount++;
      }
    }
    if (modifiedCount > 0) saveStoreToDisk();
    return { acknowledged: true, modifiedCount };
  };
};

const enableLocalStore = () => {
  if (isLocalStoreActive) return;
  isLocalStoreActive = true;

  loadStoreFromDisk();

  const User = require('../models/User');
  const FootprintLog = require('../models/FootprintLog');
  const Activity = require('../models/Activity');
  const UserActivityCycle = require('../models/UserActivityCycle');
  const ActivityCheckIn = require('../models/ActivityCheckIn');
  const GreenPointTransaction = require('../models/GreenPointTransaction');
  const EcoScoreTransaction = require('../models/EcoScoreTransaction');
  const UserDismissedActivity = require('../models/UserDismissedActivity');

  bindModelToCollection(User, 'users');
  bindModelToCollection(FootprintLog, 'footprintLogs');
  bindModelToCollection(Activity, 'activities');
  bindModelToCollection(UserActivityCycle, 'userActivityCycles');
  bindModelToCollection(ActivityCheckIn, 'activityCheckIns');
  bindModelToCollection(GreenPointTransaction, 'greenPointTransactions');
  bindModelToCollection(EcoScoreTransaction, 'ecoScoreTransactions');
  bindModelToCollection(UserDismissedActivity, 'userDismissedActivities');

  console.log(
    `📦 [LocalStore] Active (${store.activities.length} activities, ${store.users.length} users persisted in server/.local-db.json)`
  );
};

module.exports = {
  enableLocalStore,
  isLocalStoreEnabled: () => isLocalStoreActive,
};

