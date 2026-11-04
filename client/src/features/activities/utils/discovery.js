/**
 * Activity discovery helpers: search + filters + sorting.
 * Pure functions (no React) so they can be unit-tested with plain Node.
 * Search, filters and sort are applied together by `applyDiscovery`.
 */

const CATEGORY_LABELS = {
  energy: 'Energy Conservation',
  transport: 'Sustainable Transportation',
  waste: 'Waste Management',
  water: 'Water Conservation',
};

const DIFFICULTY_RANK = { easy: 0, medium: 1, hard: 2 };
const DURATION_RANK = { short: 0, medium: 1, long: 2 };
const STATUS_RANK = { available: 0, expired: 0, active: 1, completed: 2 };

// Carbon bands are based on `totalCycleCarbonSavingKg` (comparable per-challenge estimate)
const CARBON_BANDS = [
  { key: 'any', label: 'Any', test: () => true },
  { key: 'low', label: 'Low (< 1 kg)', test: (v) => v !== null && v < 1 },
  { key: 'medium', label: 'Medium (1-5 kg)', test: (v) => v !== null && v >= 1 && v <= 5 },
  { key: 'high', label: 'High (> 5 kg)', test: (v) => v !== null && v > 5 },
];
const ECO_OPTIONS = [
  { key: 'any', label: 'Any', min: 0 },
  { key: '3', label: '3+', min: 3 },
  { key: '5', label: '5+', min: 5 },
  { key: '8', label: '8+', min: 8 },
];
const POINTS_OPTIONS = [
  { key: 'any', label: 'Any', min: 0 },
  { key: '15', label: '15+', min: 15 },
  { key: '30', label: '30+', min: 30 },
  { key: '45', label: '45+', min: 45 },
];

const SORT_OPTIONS = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'eco_desc', label: 'Highest EcoScore' },
  { key: 'points_desc', label: 'Highest GreenPoints' },
  { key: 'carbon_desc', label: 'Highest carbon savings' },
  { key: 'carbon_asc', label: 'Lowest carbon savings' },
  { key: 'duration_asc', label: 'Shortest duration' },
  { key: 'difficulty_asc', label: 'Lowest difficulty' },
];

const DEFAULT_FILTERS = {
  categories: [],
  difficulties: [],
  durations: [],
  carbon: 'any',
  eco: 'any',
  points: 'any',
};

const num = (v, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/** Comparable carbon number (kg CO2e per challenge / projected period), or null if qualitative. */
function carbonValue(a) {
  if (a.isQuantitativeImpact === false) return null;
  const v = num(a.totalCycleCarbonSavingKg, 0);
  return v > 0 ? v : null;
}

const idOf = (a) => a.activityId || a.id;
const minutesOf = (a) => num(a.estimatedMinutes, 9999);
const difficultyOf = (a) => (a.difficulty in DIFFICULTY_RANK ? DIFFICULTY_RANK[a.difficulty] : 1);
const ecoOf = (a) => num(a.ecoScoreReward);
const pointsOf = (a) => num(a.greenPointsReward);
const titleOf = (a) => String(a.title || '');

function haystack(a) {
  return [
    a.title,
    a.description,
    a.whyItMatters,
    a.category,
    CATEGORY_LABELS[a.category],
    ...(Array.isArray(a.keywords) ? a.keywords : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchesSearch(a, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  for (const [catKey, label] of Object.entries(CATEGORY_LABELS)) {
    if (label.toLowerCase() === q || catKey === q) {
      return a.category === catKey;
    }
  }
  const tokens = q.split(/\s+/).filter(Boolean);
  const text = haystack(a);
  return tokens.every((t) => text.includes(t));
}

function matchesFilters(a, filters) {
  const f = { ...DEFAULT_FILTERS, ...(filters || {}) };
  if (f.categories.length && !f.categories.includes(a.category)) return false;
  if (f.difficulties.length && !f.difficulties.includes(a.difficulty)) return false;
  if (f.durations.length && !f.durations.includes(a.durationBucket)) return false;
  const band = CARBON_BANDS.find((b) => b.key === f.carbon) || CARBON_BANDS[0];
  if (!band.test(carbonValue(a))) return false;
  const eco = ECO_OPTIONS.find((o) => o.key === f.eco) || ECO_OPTIONS[0];
  if (ecoOf(a) < eco.min) return false;
  const pts = POINTS_OPTIONS.find((o) => o.key === f.points) || POINTS_OPTIONS[0];
  if (pointsOf(a) < pts.min) return false;
  return true;
}

const byTitle = (a, b) => titleOf(a).localeCompare(titleOf(b));

function sortActivities(list, sortKey = 'recommended') {
  const arr = [...list];
  const cmp = {
    recommended: (a, b) => {
      const sa = STATUS_RANK[a.userStatus] ?? 0;
      const sb = STATUS_RANK[b.userStatus] ?? 0;
      if (sa !== sb) return sa - sb;
      const ra = ecoOf(a) + pointsOf(a) / 5;
      const rb = ecoOf(b) + pointsOf(b) / 5;
      return rb - ra || byTitle(a, b);
    },
    eco_desc: (a, b) => ecoOf(b) - ecoOf(a) || pointsOf(b) - pointsOf(a) || byTitle(a, b),
    points_desc: (a, b) => pointsOf(b) - pointsOf(a) || ecoOf(b) - ecoOf(a) || byTitle(a, b),
    carbon_desc: (a, b) => {
      const ca = carbonValue(a);
      const cb = carbonValue(b);
      if (ca === null && cb === null) return byTitle(a, b);
      if (ca === null) return 1; // qualitative activities always last
      if (cb === null) return -1;
      return cb - ca || byTitle(a, b);
    },
    carbon_asc: (a, b) => {
      const ca = carbonValue(a);
      const cb = carbonValue(b);
      if (ca === null && cb === null) return byTitle(a, b);
      if (ca === null) return 1;
      if (cb === null) return -1;
      return ca - cb || byTitle(a, b);
    },
    duration_asc: (a, b) => minutesOf(a) - minutesOf(b) || difficultyOf(a) - difficultyOf(b) || byTitle(a, b),
    difficulty_asc: (a, b) => difficultyOf(a) - difficultyOf(b) || minutesOf(a) - minutesOf(b) || byTitle(a, b),
  }[sortKey] || null;
  return cmp ? arr.sort(cmp) : arr;
}

function activeFilterCount(filters) {
  const f = { ...DEFAULT_FILTERS, ...(filters || {}) };
  return (
    f.categories.length +
    f.difficulties.length +
    f.durations.length +
    (f.carbon !== 'any' ? 1 : 0) +
    (f.eco !== 'any' ? 1 : 0) +
    (f.points !== 'any' ? 1 : 0)
  );
}

function applyDiscovery(list, { query = '', filters = DEFAULT_FILTERS, sort = 'recommended' } = {}) {
  const filtered = (list || []).filter((a) => matchesSearch(a, query) && matchesFilters(a, filters));
  return sortActivities(filtered, sort);
}

/** Human-readable CO2e line for cards and details. */
function formatCarbonLine(a) {
  if (a.isQuantitativeImpact === false || !(num(a.carbonSavingKgCO2e) > 0)) {
    return a.isQuantitativeImpact === false ? 'Qualitative impact (not quantified)' : 'Impact not quantified';
  }
  const v = num(a.carbonSavingKgCO2e);
  const shown = v >= 0.1 ? v.toFixed(2).replace(/\.?0+$/, '') : v < 0.01 ? v.toFixed(3) : v.toFixed(2);
  const per = String(a.impactUnit || '').replace(/^kg CO₂e\s*/i, '') || 'per completion';
  return `~${shown} kg CO₂e ${per}`;
}

module.exports = {
  CATEGORY_LABELS,
  CARBON_BANDS,
  ECO_OPTIONS,
  POINTS_OPTIONS,
  SORT_OPTIONS,
  DEFAULT_FILTERS,
  carbonValue,
  matchesSearch,
  matchesFilters,
  sortActivities,
  activeFilterCount,
  applyDiscovery,
  formatCarbonLine,
  idOf,
};
