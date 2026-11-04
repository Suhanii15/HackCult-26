/**
 * Mission LiFE Gen-Z Microcopy & Messaging System
 * Centralized, context-aware messaging with rotational variety and natural tone.
 */

export const MICROCOPY = {
  greetings: {
    morning: [
      'Rise and shine, legend ☀️',
      'Wakey wakey, eco bestie.',
      'We up! 🌱',
      'Ready to make some green moves?',
      'New day, new planet-saving energy.',
    ],
    afternoon: [
      "Yo, what's good?",
      'Hey, earth warrior.',
      "What's the vibe today?",
      'Midday check-in, eco icon.',
      "Let's make today count.",
    ],
    evening: [
      "What's poppin'?",
      'Sup, legend?',
      'Evening, planet saver.',
      'Clocking out? Not before one green move.',
      'Your planet-saving era continues.',
    ],
    night: [
      'Still grinding, huh?',
      'Night owl spotted 🦉',
      'One last green move before bed?',
      'Late-night eco energy.',
      'Rest up, the planet will need you tomorrow.',
    ],
  },

  returningUsers: [
    "Look who's back!",
    'Missed you, bestie.',
    "The planet called. You're needed.",
    'Back on your eco grind?',
    'We got some catching up to do.',
    'The comeback arc begins.',
  ],

  checkInSuccess: [
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

  challengeCompletion: [
    'Quest conquered! 🏆',
    'Certified planet saver.',
    "You're built different.",
    'Eco icon behaviour.',
    'Another green W in the books.',
    "That's how legends go green.",
    'Main character energy.',
    'Eco goals unlocked!',
  ],

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

  duplicateEnrollment: [
    "You're already on this quest, bestie. Keep going! 🌱",
    'Already working on this one. Stay locked in!',
    'This quest is already in your lineup!',
    'One quest at a time for this one, legend.',
  ],

  streaks: [
    "You're on a roll!",
    'The streak is streaking.',
    "Five days? You're actually committed.",
    "Don't break the chain now!",
    'Consistency looks good on you.',
    'Another day, another green W.',
    'Your dedication is showing.',
  ],

  reminders: [
    'Bestie, that AC could use a break.',
    'Tiny reminder: unplug that charger!',
    'Psst... your lights are still on.',
    "Don't let that water go to waste!",
    'A little less electricity, a little more planet love.',
    'Your reusable bottle is waiting for you.',
    'That short trip could be a walking side quest.',
  ],

  dashboardQuotes: [
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
  ],
};

// Stable session greeting selection (prevents jarring changes on every component re-render)
let sessionGreetingCache = null;
let sessionGreetingHour = null;

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (sessionGreetingCache && sessionGreetingHour === hour) {
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
  return selected;
}

export function getRandomItem(list) {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list[Math.floor(Math.random() * list.length)];
}

export function getCheckInSuccessMessage() {
  return getRandomItem(MICROCOPY.checkInSuccess);
}

export function getChallengeCompletionMessage() {
  return getRandomItem(MICROCOPY.challengeCompletion);
}

export function getDuplicateEnrollmentMessage() {
  return getRandomItem(MICROCOPY.duplicateEnrollment);
}

export function getEmptyActiveMessage() {
  return getRandomItem(MICROCOPY.emptyStates.activeQuests);
}

export function getEmptyCompletedMessage() {
  return getRandomItem(MICROCOPY.emptyStates.completedChallenges);
}

export function getNextDashboardQuote(currentQuote = null) {
  const list = MICROCOPY.dashboardQuotes;
  if (!Array.isArray(list) || list.length === 0) return '';
  const candidates = list.filter((q) => q !== currentQuote);
  const pool = candidates.length > 0 ? candidates : list;
  return pool[Math.floor(Math.random() * pool.length)];
}
