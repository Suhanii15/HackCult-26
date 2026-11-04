/**
 * EcoPulse Centralized Microcopy & Gen-Z Messaging System
 *
 * Organized into standardized categories with natural, context-aware phrasing:
 * - greetings
 * - dashboard
 * - leaderboard
 * - community
 * - activities
 * - solar
 * - profile
 * - achievements
 * - rewards
 * - emptyStates
 * - reminders
 * - successMessages
 * - loadingMessages
 * - errors
 */
import { MICROCOPY_TRANSLATIONS } from '../i18n/microcopyTranslations';
import { getActiveLanguage } from '../i18n/activeLanguage';

const MICROCOPY_EN = {
  // 1. Time-based & Contextual Greetings
  greetings: {
    morning: [
      'Rise and shine, legend ☀️',
      'Wakey wakey, eco bestie.',
      'We up! 🌱',
      'Ready to make some green moves?',
      'New day, new planet-saving energy.',
      'Morning grind starts green.',
    ],
    afternoon: [
      "Yo, what's good?",
      'Hey, earth warrior.',
      "What's the vibe today?",
      'Midday check-in, eco icon.',
      "Let's make today count.",
      'Catching that afternoon solar glow.',
    ],
    evening: [
      "What's poppin'?",
      'Sup, legend?',
      'Evening, planet saver.',
      'Clocking out? Not before one green move.',
      'Your planet-saving era continues.',
      'Unwinding with low-carbon energy.',
    ],
    night: [
      'Still grinding, huh?',
      'Night owl spotted 🦉',
      'One last green move before bed?',
      'Late-night eco energy.',
      'Rest up, the planet will need you tomorrow.',
      'Switch off those phantom loads and snooze.',
    ],
    returning: [
      "Look who's back!",
      'Missed you, bestie.',
      "The planet called. You're needed.",
      'Back on your eco grind?',
      'We got some catching up to do.',
      'The comeback arc begins.',
    ],
  },

  // 2. Dashboard Quotes & Labels
  dashboard: {
    heroTag: 'YOUR GREEN ERA 🌱',
    quotes: [
      'Your small moves are making a big difference.',
      'The planet called. It says keep going.',
      'Less carbon, more main character energy.',
      'One green move at a time.',
      'Your eco era is looking strong.',
      'Another day, another chance to make an impact.',
      'Small habits. Massive W.',
      'The future looks greener with you in it.',
      'Keep your green streak alive!',
      "You're doing your bit. Keep going, legend.",
      'Eco goals unlocked, one day at a time.',
      'Low carbon, high impact.',
    ],
    labels: {
      ecoScore: 'ECOSCORE',
      ecoScoreSub: 'Planet rating',
      greenPoints: 'GREENPOINTS',
      greenPointsSub: 'Reward balance',
      activeQuests: 'ACTIVE QUESTS',
      activeQuestsSub: 'In progress ➔',
      co2Avoided: 'CO₂ AVOIDED',
      co2AvoidedSub: 'Verified saved',
      todayMissions: "Today's missions",
      todaySideQuest: "Today's side quest",
      checkStats: 'Check your stats ➔',
      browseAll: 'Browse All 59 Missions & Quests 🌿',
      browseSub: 'Energy • Transportation • Waste • Water Conservation',
    },
  },

  // 3. Leaderboard Screen
  leaderboard: {
    title: "Who's running the green game? 🏆",
    subtitle: 'Top eco icons across Gujarat',
    hallOfFame: 'The green hall of fame',
    yourRank: 'Your rank, your flex',
    climbing: 'Climbing the green ladder?',
    keepCollecting: 'Keep collecting those green Ws.',
    scopes: {
      area: 'My Area',
      district: 'District',
      state: 'Gujarat State',
    },
    tabs: {
      points: 'GreenPoints 🌿',
      ecoScore: 'EcoScore ⚡',
      co2: 'CO₂ Avoided 🌱',
    },
    podium: {
      gold: '1st • Eco Icon',
      silver: '2nd • Green Star',
      bronze: '3rd • Planet Hero',
    },
    empty: {
      title: 'The leaderboard is waiting for its first legends.',
      subtitle: 'No rankings yet. Time to get the green game going!',
    },
  },

  // 4. Community Screen
  community: {
    title: 'The Green Corner 🌱',
    subtitle: "What's the planet-saving tea?",
    feedHeader: 'See what the community is cooking',
    sharePrompt: 'Spill your green ideas',
    dropWin: 'Drop a green W',
    showOff: 'Show off your latest eco win.',
    startConvo: "Let's get the conversation growing.",
    buttons: {
      dropPost: 'Drop a post',
      shareMove: 'Share your green move',
      talk: "Let's talk",
      showMore: 'Show more',
    },
    empty: {
      title: "It's a little quiet here. Start the conversation!",
      subtitle: 'No posts yet. Be the first to drop a green W.',
    },
  },

  // 5. Activities & Quest Flow
  activities: {
    title: 'Your next green side quest',
    subtitle: 'Pick your next planet-saving move',
    activeTitle: 'Your active quests',
    completedTitle: "Quests you've conquered",
    findNext: 'Find your next green W',
    buildHabits: "Let's get those habits going",
    buttons: {
      start: "Let's get it",
      inProgress: 'Already on this quest, bestie!',
      complete: 'Done and dusted',
      conquered: 'Quest conquered!',
      keepStreak: 'Keep the streak alive',
      anotherWin: 'One more green W',
      assessment: 'Personalise my plan ✦',
    },
    duplicateEnrollment: [
      "You're already on this quest, bestie. Keep going! 🌱",
      'Already working on this one. Stay locked in!',
      'This quest is already in your lineup!',
      'One quest at a time for this one, legend.',
    ],
    categories: {
      energy: 'Energy Efficiency',
      transport: 'Sustainable Mobility',
      waste: 'Circular Waste',
      water: 'Water Conservation',
    },
  },

  // 6. Solar Hub & Feasibility
  solar: {
    title: 'Your solar era starts here ☀️',
    subtitle: "Let's put that rooftop to work.",
    assessmentPrompt: 'Is your roof solar-ready?',
    sunshinePotential: 'Your sunshine potential',
    savingsProjection: "Let's see what the sun can save",
    gamePlan: 'Your clean-energy game plan.',
    buttons: {
      checkPotential: 'Check my solar potential',
      calculate: "Let's calculate",
      seeSavings: 'See my savings',
      exploreVendors: 'Explore verified solar EPCs',
      call: 'Call Installer',
      whatsapp: 'WhatsApp Enquiry',
    },
    mascotDialogues: {
      welcome: "Ready to tap into the sun? Let's check your roof power!",
      adjust: 'Nudge that bill slider to match your monthly electric spend.',
      survey: 'Measuring your shadow-free roof! Every sq.ft counts.',
      celebrate: 'Big W! Your roof can save serious cash and carbon!',
      partner: 'Connect with verified PM Surya Ghar vendors right here.',
    },
  },

  // 7. Profile Screen
  profile: {
    title: 'Your green identity',
    subtitle: 'Your eco journey across Gujarat',
    hallOfTrophies: 'The green W collection',
    conqueredSection: "Quests you've conquered",
    impactSection: 'Your impact so far',
    rewardsCorner: 'Your rewards corner',
    accountRules: 'Your account, your rules.',
    buttons: {
      edit: 'Edit my profile',
      achievements: 'Check my achievements',
      history: 'See my reward history',
      update: 'Update my details',
      logout: 'Log out',
    },
    empty: {
      title: 'Your green story starts here.',
      conquered: 'No quests conquered yet. Your first one is waiting!',
      trophies: 'Nothing in the trophy cabinet just yet.',
    },
  },

  // 8. Achievements
  achievements: [
    'Certified planet saver.',
    "You're built different.",
    "That's some serious green energy.",
    'Bro understood the assignment.',
    'Eco icon behaviour.',
    'Another W in the books.',
    "Touch grass? You're already saving it.",
    'Your green era is looking strong.',
    'Carbon footprint? Getting humbled.',
  ],

  // 9. Rewards & Badges
  rewards: {
    earnedTitle: 'Green rewards unlocked!',
    streakBonus: 'Streak multiplier active 🔥',
    ecoScoreBoost: '+5 EcoScore planet rating',
    pointsEarned: '+25 GreenPoints added',
  },

  // 10. Empty States
  emptyStates: {
    activeQuests: [
      'No quests yet. Wanna change that?',
      "It's looking a little empty here.",
      'Your eco era starts now.',
      "Nothing cooking yet. Let's fix that.",
    ],
    history: [
      'New here? We all start somewhere.',
      'Your green story starts today.',
      'Every planet saver starts somewhere.',
    ],
    community: [
      "It's quiet in here. Start the conversation.",
      'Your community needs its first green W.',
    ],
    completedChallenges: [
      'No quests conquered yet.',
      'Your first green achievement is waiting.',
    ],
  },

  // 11. Habit & Check-in Reminders
  reminders: [
    'Bestie, that AC could use a break.',
    'Tiny reminder: unplug that charger!',
    'Psst... your lights are still on.',
    "Don't let that water go to waste!",
    'A little less electricity, a little more planet love.',
    'Your reusable bottle is waiting for you.',
    'That short trip could be a walking side quest.',
  ],

  // 12. Success Messages
  successMessages: {
    checkIn: [
      'Slay! You did that.',
      'Absolute W!',
      "That's a W for the planet.",
      "You're cooking! 🔥",
      'Mother Earth says thanks.',
      'Big green energy!',
      'Clean work, literally.',
      'Planet-saving behaviour detected.',
      'You understood the assignment.',
    ],
    questComplete: [
      'Quest conquered! 🏆',
      'Certified planet saver.',
      "You're built different.",
      'Eco icon behaviour.',
      'Another green W in the books.',
      "That's how legends go green.",
      'Main character energy.',
      'Eco goals unlocked!',
    ],
    otpVerified: 'Verification complete! Welcome to your EcoPulse era 🌱',
  },

  // 13. Loading Messages
  loadingMessages: [
    'Calculating your green impact...',
    'Crunching the carbon numbers...',
    'Loading your planet dashboard...',
    'Connecting with the sun...',
    'Powering up your green stats...',
  ],

  // 14. Error Feedback
  errors: {
    network: 'Unable to reach the server. Make sure your Wi-Fi is connected.',
    invalidOtp: 'Invalid code, bestie. Double check those digits!',
    expiredOtp: 'Code expired. Tap Resend to get a fresh one.',
    rateLimit: 'Slow down, legend! Please wait a moment before trying again.',
  },

  // Backwards-compatible terminology aliases
  terminology: {
    dailyTasks: "Today's missions",
    startChallenge: "Let's get it",
    completeTask: 'Done and dusted',
    viewProgress: 'Check your stats',
    continue: 'Keep going',
    newChallenge: 'New side quest',
    challengeCompleted: 'Quest conquered!',
    tasksRemaining: 'More to go, bestie',
    activityHistory: 'Your green journey',
    myActivities: 'My active quests',
  },
};

function deepMerge(base, over) {
  if (Array.isArray(over)) return over;
  if (over && typeof over === 'object' && base && typeof base === 'object' && !Array.isArray(base)) {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = deepMerge(base[k], over[k]);
    return out;
  }
  return over === undefined ? base : over;
}

const MICROCOPY_BY_LANG = {
  en: MICROCOPY_EN,
  gu: deepMerge(MICROCOPY_EN, MICROCOPY_TRANSLATIONS.gu),
  hi: deepMerge(MICROCOPY_EN, MICROCOPY_TRANSLATIONS.hi),
};

/**
 * Language-aware microcopy. Reads resolve against the active UI language
 * (falling back to English for any missing key), so existing MICROCOPY.x.y usages
 * translate automatically when the user changes language.
 */
export const MICROCOPY = new Proxy(MICROCOPY_EN, {
  get(_target, prop) {
    const dict = MICROCOPY_BY_LANG[getActiveLanguage()] || MICROCOPY_EN;
    return dict[prop];
  },
});

// Stable session greeting selection
let sessionGreetingCache = null;
let sessionGreetingHour = null;
let sessionGreetingLang = null;

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (sessionGreetingCache && sessionGreetingHour === hour && sessionGreetingLang === getActiveLanguage()) {
    return sessionGreetingCache;
  }

  let bucket = 'afternoon';
  if (hour >= 5 && hour < 12) {
    bucket = 'morning';
  } else if (hour >= 12 && hour < 17) {
    bucket = 'afternoon';
  } else if (hour >= 17 && hour < 22) {
    bucket = 'evening';
  } else {
    bucket = 'night';
  }

  const pool = MICROCOPY.greetings[bucket];
  const selected = pool[Math.floor(Math.random() * pool.length)];
  sessionGreetingCache = selected;
  sessionGreetingHour = hour;
  sessionGreetingLang = getActiveLanguage();
  return selected;
}

export function getRandomItem(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list[Math.floor(Math.random() * list.length)];
}

export function getCheckInSuccessMessage() {
  return getRandomItem(MICROCOPY.successMessages.checkIn);
}

export function getChallengeCompletionMessage() {
  return getRandomItem(MICROCOPY.successMessages.questComplete);
}

export function getDuplicateEnrollmentMessage() {
  return getRandomItem(MICROCOPY.activities.duplicateEnrollment);
}

export function getEmptyActiveMessage() {
  return getRandomItem(MICROCOPY.emptyStates.activeQuests);
}

export function getEmptyCompletedMessage() {
  return getRandomItem(MICROCOPY.emptyStates.completedChallenges);
}

export function getNextDashboardQuote(currentQuote = null) {
  const list = MICROCOPY.dashboard.quotes;
  if (!Array.isArray(list) || list.length === 0) return '';
  const candidates = list.filter((q) => q !== currentQuote);
  const pool = candidates.length > 0 ? candidates : list;
  return pool[Math.floor(Math.random() * pool.length)];
}
