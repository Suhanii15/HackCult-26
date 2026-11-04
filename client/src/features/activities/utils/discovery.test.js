/**
 * Plain-Node tests for search / filter / sort (no test framework needed).
 *   node client/src/features/activities/utils/discovery.test.js
 */
const { ACTIVITY_CATALOG } = require('../../../activities/activityCatalog');
const {
  applyDiscovery, DEFAULT_FILTERS, SORT_OPTIONS, carbonValue, activeFilterCount, formatCarbonLine,
} = require('./discovery');

let passed = 0;
let failed = 0;
const check = (name, cond, detail = '') => {
  if (cond) { passed += 1; console.log(`  ✅ ${name}`); }
  else { failed += 1; console.log(`  ❌ ${name} ${detail}`); }
};
const ids = (list) => list.map((a) => a.activityId);
const all = ACTIVITY_CATALOG.map((a, i) => ({ ...a, userStatus: i % 7 === 0 ? 'completed' : i % 5 === 0 ? 'active' : 'available' }));

console.log('\n[Search]');
check('empty query returns everything', applyDiscovery(all, {}).length === all.length);
check('case-insensitive title search ("CYCLE")', ids(applyDiscovery(all, { query: 'CYCLE' })).includes('transport_cycle_instead_of_driving'));
check('keyword search ("kabadiwala") finds paper recycling', ids(applyDiscovery(all, { query: 'kabadiwala' })).includes('waste_recycle_paper'));
check('description search ("compost")', ids(applyDiscovery(all, { query: 'compost' })).includes('waste_compost'));
check('category-name search ("water conservation") returns water activities', (() => {
  const r = applyDiscovery(all, { query: 'water conservation' });
  return r.length > 0 && r.every((a) => /water conservation/i.test(a.category === 'water' ? 'water conservation' : a.description + a.title + a.whyItMatters));
})());
check('multi-word AND matching ("led bulb")', ids(applyDiscovery(all, { query: 'led bulb' })).includes('energy_replace_led'));
check('no results for gibberish', applyDiscovery(all, { query: 'zzzxqq' }).length === 0);
check('whitespace-only query = no search', applyDiscovery(all, { query: '   ' }).length === all.length);

console.log('\n[Filters]');
const f = (patch) => ({ ...DEFAULT_FILTERS, ...patch });
check('category filter', applyDiscovery(all, { filters: f({ categories: ['transport'] }) }).every((a) => a.category === 'transport'));
check('multi-category filter (OR within category)', new Set(applyDiscovery(all, { filters: f({ categories: ['water', 'energy'] }) }).map((a) => a.category)).size === 2);
check('difficulty filter hard', applyDiscovery(all, { filters: f({ difficulties: ['hard'] }) }).every((a) => a.difficulty === 'hard'));
check('duration filter short', applyDiscovery(all, { filters: f({ durations: ['short'] }) }).every((a) => a.durationBucket === 'short'));
check('carbon "high" only returns > 5 kg quantified', applyDiscovery(all, { filters: f({ carbon: 'high' }) }).every((a) => carbonValue(a) > 5));
check('carbon "low" excludes qualitative activities', applyDiscovery(all, { filters: f({ carbon: 'low' }) }).every((a) => carbonValue(a) !== null && carbonValue(a) < 1));
check('EcoScore 8+ filter', applyDiscovery(all, { filters: f({ eco: '8' }) }).every((a) => a.ecoScoreReward >= 8));
check('GreenPoints 30+ filter', applyDiscovery(all, { filters: f({ points: '30' }) }).every((a) => a.greenPointsReward >= 30));
const combo = applyDiscovery(all, { query: 'travel', filters: f({ categories: ['transport'], difficulties: ['hard'], points: '30' }) });
check('search + combined filters work together', combo.length > 0 && combo.every((a) => a.category === 'transport' && a.difficulty === 'hard' && a.greenPointsReward >= 30), ids(combo).join());
const combo2 = applyDiscovery(all, { filters: f({ categories: ['energy'], difficulties: ['easy'], durations: ['short'], eco: '3', carbon: 'low' }) });
check('6-way filter combination is the intersection', combo2.every((a) => a.category === 'energy' && a.difficulty === 'easy' && a.durationBucket === 'short' && a.ecoScoreReward >= 3 && carbonValue(a) < 1 && carbonValue(a) !== null));
check('impossible combination -> empty (no-results state)', applyDiscovery(all, { query: 'shower', filters: f({ categories: ['transport'] }) }).length === 0);
check('reset (default filters) restores all', applyDiscovery(all, { filters: DEFAULT_FILTERS }).length === all.length);
check('activeFilterCount counts every selection', activeFilterCount(f({ categories: ['a', 'b'], carbon: 'low', eco: '5' })) === 4);

console.log('\n[Sorting] (every option)');
const sorted = (key) => applyDiscovery(all, { sort: key });
const monotone = (list, fn, dir) => list.every((x, i) => i === 0 || (dir === 'desc' ? fn(list[i - 1]) >= fn(x) : fn(list[i - 1]) <= fn(x)));
check('all 7 sort options exist', SORT_OPTIONS.length === 7);
check('every sort keeps all items (no loss / duplication)', SORT_OPTIONS.every((o) => new Set(ids(sorted(o.key))).size === all.length));
check('Highest EcoScore', monotone(sorted('eco_desc'), (a) => a.ecoScoreReward, 'desc'));
check('Highest GreenPoints', monotone(sorted('points_desc'), (a) => a.greenPointsReward, 'desc'));
{
  const d = sorted('carbon_desc');
  const quant = d.filter((a) => carbonValue(a) !== null);
  check('Highest carbon: normalised comparable values descend', monotone(quant, carbonValue, 'desc'));
  check('Highest carbon: qualitative activities come last', d.slice(quant.length).every((a) => carbonValue(a) === null));
  check('Highest carbon: a per-trip 54 kg flight swap outranks a 0.4 kg/day item', ids(d)[0] === 'transport_train_over_flight');
  const asc = sorted('carbon_asc');
  const qa = asc.filter((a) => carbonValue(a) !== null);
  check('Lowest carbon: ascending', monotone(qa, carbonValue, 'asc'));
  check('Lowest carbon: qualitative still last (never ranked as "lowest")', asc.slice(qa.length).every((a) => carbonValue(a) === null));
}
check('Shortest duration', monotone(sorted('duration_asc'), (a) => a.estimatedMinutes, 'asc'));
check('Lowest difficulty', monotone(sorted('difficulty_asc'), (a) => ({ easy: 0, medium: 1, hard: 2 }[a.difficulty]), 'asc'));
{
  const r = sorted('recommended');
  const rank = { available: 0, expired: 0, active: 1, completed: 2 };
  check('Recommended: unfinished first, completed last', monotone(r, (a) => rank[a.userStatus], 'asc'));
}
check('sorting does not mutate the input', ids(all)[0] === ACTIVITY_CATALOG[0].activityId);

console.log('\n[Formatting]');
check('quantified line', /kg CO₂e per trip/.test(formatCarbonLine(ACTIVITY_CATALOG.find((a) => a.activityId === 'transport_cycle_instead_of_driving'))));
check('qualitative line has no number', !/\d/.test(formatCarbonLine(ACTIVITY_CATALOG.find((a) => a.activityId === 'waste_native_tree'))));

console.log(`\n${failed ? '💥' : '🎉'} Discovery tests: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
