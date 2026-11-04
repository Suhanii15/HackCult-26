/**
 * Activities backend test suite.
 * Runs against a THROWAWAY in-memory MongoDB (never touches your real database).
 *   npm run test:activities
 */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../models/User');
const Activity = require('../models/Activity');
const UserActivityCycle = require('../models/UserActivityCycle');
const ActivityCheckIn = require('../models/ActivityCheckIn');
const GreenPointTransaction = require('../models/GreenPointTransaction');
const EcoScoreTransaction = require('../models/EcoScoreTransaction');
const UserDismissedActivity = require('../models/UserDismissedActivity');
const { seedActivities } = require('./seedActivities');
const { ACTIVITY_CATALOG, computeCarbonSaving } = require('../../shared/activities/activityCatalog');
const ctl = require('../controllers/activityController');

let passed = 0;
let failed = 0;
const failures = [];
function check(name, cond, detail = '') {
  if (cond) {
    passed += 1;
    console.log(`  ✅ ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`  ❌ ${name} ${detail}`);
  }
}
const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

function call(handler, user, { params = {}, body = {}, query = {} } = {}) {
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        resolve({ status: this.statusCode, body: data });
        return this;
      },
    };
    Promise.resolve(handler({ user, params, body, query }, res)).catch(reject);
  });
}

const dateStr = (offsetDays = 0) => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

let userCounter = 0;
async function newUser() {
  userCounter += 1;
  return User.create({
    fullName: `Tester ${userCounter}`,
    email: `tester${userCounter}@example.com`,
    password: 'password123',
  });
}

async function freshUser(id) {
  return User.findById(id);
}

async function main() {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: 'mission_life_test' });
  await Promise.all(
    [User, Activity, UserActivityCycle, ActivityCheckIn, GreenPointTransaction, EcoScoreTransaction, UserDismissedActivity].map(
      (m) => m.syncIndexes()
    )
  );

  // ─────────────────────────────────────────────────────────────
  console.log('\n[1] Catalogue integrity');
  const byCat = ACTIVITY_CATALOG.reduce((a, x) => ((a[x.category] = (a[x.category] || 0) + 1), a), {});
  console.log('   per category:', JSON.stringify(byCat));
  check('exactly the 4 existing categories', Object.keys(byCat).sort().join() === 'energy,transport,waste,water');
  check('12-20 activities per category', Object.values(byCat).every((n) => n >= 12 && n <= 20));
  check('all activityIds are unique', new Set(ACTIVITY_CATALOG.map((a) => a.activityId)).size === ACTIVITY_CATALOG.length);
  check('no activity uses the old flat 5/20 reward for everything',
    new Set(ACTIVITY_CATALOG.map((a) => `${a.ecoScoreReward}/${a.greenPointsReward}`)).size >= 20);
  check('EcoScore and GreenPoints are independent values (many differ from 5/20)',
    ACTIVITY_CATALOG.filter((a) => a.ecoScoreReward !== 5 || a.greenPointsReward !== 20).length > ACTIVITY_CATALOG.length - 3);
  const required = ['carbonSavingKgCO2e', 'impactUnit', 'impactQuantity', 'impactDuration', 'impactDescription',
    'calculationMethod', 'emissionFactor', 'assumptions', 'impactType'];
  check('every activity has all impact fields populated',
    ACTIVITY_CATALOG.every((a) => required.every((f) => a[f] !== undefined && a[f] !== '' && a[f] !== null)),
    ACTIVITY_CATALOG.filter((a) => !required.every((f) => a[f] !== undefined && a[f] !== '' && a[f] !== null)).map((a) => a.activityId).join());
  check('qualitative activities never carry a fabricated CO2e number',
    ACTIVITY_CATALOG.filter((a) => !a.isQuantitativeImpact).every((a) => a.carbonSavingKgCO2e === 0 && a.totalCycleCarbonSavingKg === 0));
  check('quantified activities have positive savings and a stated emission factor',
    ACTIVITY_CATALOG.filter((a) => a.isQuantitativeImpact).every((a) => a.carbonPerQuantityKgCO2e > 0 && a.emissionFactor));
  const led = ACTIVITY_CATALOG.find((a) => a.activityId === 'energy_replace_led');
  check('LED example matches ~0.07 kg/day', near(led.carbonSavingKgCO2e, 0.075, 0.01), String(led.carbonSavingKgCO2e));
  const cyc = ACTIVITY_CATALOG.find((a) => a.activityId === 'transport_cycle_instead_of_driving');
  check('Cycling 3 km example is in the 0.4-0.6 kg range', cyc.carbonSavingKgCO2e >= 0.4 && cyc.carbonSavingKgCO2e <= 0.6, String(cyc.carbonSavingKgCO2e));

  // ─────────────────────────────────────────────────────────────
  console.log('\n[2] Seeding preserves existing data');
  const legacy = await Activity.create({
    activityId: 'energy_switch_off_unused', title: 'Old title', titleKey: 'k', description: 'old',
    category: 'energy', ecoScoreReward: 5, greenPointsReward: 20,
  });
  const legacyUser = await newUser();
  const legacyCycle = await UserActivityCycle.create({
    userId: legacyUser._id, activityId: 'energy_switch_off_unused', activityRef: legacy._id, status: 'completed',
    completedAt: new Date(Date.now() - 3 * 86400000), startDate: new Date(Date.now() - 10 * 86400000),
    endDate: new Date(Date.now() - 3 * 86400000), successfulCheckIns: 6, requiredCheckIns: 6,
  });
  await seedActivities({ log: () => {} });
  const total1 = await Activity.countDocuments();
  await seedActivities({ log: () => {} });
  const total2 = await Activity.countDocuments();
  check('catalogue seeded (all activities present)', total1 === ACTIVITY_CATALOG.length, `${total1}`);
  check('seeding twice is idempotent (no duplicates)', total1 === total2);
  const reseeded = await Activity.findOne({ activityId: 'energy_switch_off_unused' });
  check('existing activity keeps its _id (history stays linked)', String(reseeded._id) === String(legacy._id));
  check('existing activity updated with new reward/impact fields', reseeded.ecoScoreReward === 3 && reseeded.greenPointsReward === 12 && reseeded.carbonSavingKgCO2e > 0);
  check('historical cycle untouched', Boolean(await UserActivityCycle.findById(legacyCycle._id)));

  // ─────────────────────────────────────────────────────────────
  console.log('\n[3] Catalogue API output');
  const user = await newUser();
  {
    const r = await call(ctl.getCategories, user);
    check('4 categories returned', r.body.data.length === 4);
    const counts = Object.fromEntries(r.body.data.map((c) => [c.id, c.totalActivities]));
    check('category totals match catalogue', counts.energy === byCat.energy && counts.waste === byCat.waste, JSON.stringify(counts));
  }
  {
    const r = await call(ctl.getActivities, user, { query: { category: 'water' } });
    check('category filter returns only that category', r.body.data.every((a) => a.category === 'water') && r.body.count === byCat.water);
    const a = r.body.data[0];
    check('API returns rewards + impact + discovery fields',
      ['ecoScoreReward', 'greenPointsReward', 'carbonSavingKgCO2e', 'impactUnit', 'difficulty', 'durationBucket', 'estimatedMinutes', 'assumptions', 'calculationMethod']
        .every((f) => a[f] !== undefined));
  }
  {
    const r = await call(ctl.getActivityDetail, user, { params: { activityId: 'transport_cycle_instead_of_driving' } });
    check('detail returns the specific reward values', r.body.data.ecoScoreReward === 8 && r.body.data.greenPointsReward === 35);
  }

  // ─────────────────────────────────────────────────────────────
  console.log('\n[4] Start, concurrent cycles, duplicate start');
  const ids = ['energy_reduce_ac', 'transport_carpool', 'water_full_load_washing'];
  const cycles = {};
  for (const id of ids) {
    const r = await call(ctl.startActivity, user, { params: { activityId: id } });
    check(`start ${id} -> 201 at Day 0`, r.status === 201 && r.body.cycle.currentDayIndex === 0, JSON.stringify(r.body).slice(0, 120));
    cycles[id] = r.body.cycle;
  }
  {
    const r = await call(ctl.getActiveActivities, user);
    check('3 concurrent challenges active at once', r.body.count === 3);
    const dup = await call(ctl.startActivity, user, { params: { activityId: 'energy_reduce_ac' } });
    check('starting an already-active activity is rejected', dup.status === 400);
    const race = await Promise.all(Array.from({ length: 4 }, () => call(ctl.startActivity, user, { params: { activityId: 'transport_tyre_pressure' } })));
    check('concurrent duplicate starts create exactly one cycle', race.filter((x) => x.status === 201).length === 1 &&
      (await UserActivityCycle.countDocuments({ userId: user._id, activityId: 'transport_tyre_pressure', status: 'active' })) === 1);
    const lst = await call(ctl.getActivities, user);
    const row = lst.body.data.find((a) => a.activityId === 'energy_reduce_ac');
    check('list shows active status + enriched cycle', row.userStatus === 'active' && row.activeCycle.currentDayIndex === 0 && row.activeCycle.hasCheckedInToday === false);
  }

  // ─────────────────────────────────────────────────────────────
  console.log('\n[5] Check-ins & carbon recording');
  const acId = 'energy_reduce_ac';
  const acCycle = cycles[acId];
  const acAct = ACTIVITY_CATALOG.find((a) => a.activityId === acId);
  {
    const r = await call(ctl.submitDailyCheckIn, user, { params: { cycleId: acCycle._id }, body: { completed: true, quantity: 2 } });
    check('check-in accepted', r.status === 200 && r.body.checkIn.completed === true);
    check('carbon recorded server-side from quantity (2 h)', near(r.body.checkIn.carbonSavedKgCO2e, computeCarbonSaving(acAct, 2), 1e-5), String(r.body.checkIn.carbonSavedKgCO2e));
    const u = await freshUser(user._id);
    check('user carbon total NOT increased before completion', (u.totalCarbonSavedKg || 0) === 0);
    const dup = await call(ctl.submitDailyCheckIn, user, { params: { cycleId: acCycle._id }, body: { completed: true } });
    check('second check-in same day rejected', dup.status === 400);
    const cur = await UserActivityCycle.findById(acCycle._id);
    check('cycle counters correct after duplicate attempt', cur.successfulCheckIns === 1 && cur.totalCheckIns === 1);
  }
  {
    const cid = cycles['transport_carpool']._id;
    const burst = await Promise.all(Array.from({ length: 5 }, () => call(ctl.submitDailyCheckIn, user, { params: { cycleId: cid }, body: { completed: true } })));
    check('5 concurrent check-ins -> exactly one succeeds', burst.filter((x) => x.status === 200).length === 1);
    const cur = await UserActivityCycle.findById(cid);
    check('counters not double-counted under concurrency', cur.successfulCheckIns === 1 && cur.totalCheckIns === 1);
    const huge = await call(ctl.submitDailyCheckIn, user, { params: { cycleId: cid }, body: { completed: true, quantity: 99999, checkInDate: dateStr(0) } });
    check('(already checked in today -> rejected, not re-counted)', huge.status === 400);
  }
  {
    // clamp: new user, huge quantity
    const u2 = await newUser();
    const c = (await call(ctl.startActivity, u2, { params: { activityId: 'transport_cycle_instead_of_driving' } })).body.cycle;
    const r = await call(ctl.submitDailyCheckIn, u2, { params: { cycleId: c._id }, body: { completed: true, quantity: 99999 } });
    const act = ACTIVITY_CATALOG.find((a) => a.activityId === 'transport_cycle_instead_of_driving');
    check('absurd quantity is clamped to the activity maximum', near(r.body.checkIn.carbonSavedKgCO2e, computeCarbonSaving(act, act.maxQuantityValue), 1e-5), String(r.body.checkIn.carbonSavedKgCO2e));
    const u3 = await newUser();
    const c3 = (await call(ctl.startActivity, u3, { params: { activityId: 'transport_cycle_instead_of_driving' } })).body.cycle;
    const miss = await call(ctl.submitDailyCheckIn, u3, { params: { cycleId: c3._id }, body: { completed: false, quantity: 10 } });
    check('a "No / missed" check-in records zero carbon', miss.status === 200 && miss.body.checkIn.carbonSavedKgCO2e === 0);
    const bad = await call(ctl.submitDailyCheckIn, u3, { params: { cycleId: c3._id }, body: { completed: true, checkInDate: dateStr(2) } });
    check('future-dated check-in rejected', bad.status === 400);
    const before = await call(ctl.submitDailyCheckIn, u3, { params: { cycleId: c3._id }, body: { completed: true, checkInDate: dateStr(-5) } });
    check('check-in from before the cycle started rejected', before.status === 400);
    const stranger = await newUser();
    const forbidden = await call(ctl.submitDailyCheckIn, stranger, { params: { cycleId: c3._id }, body: { completed: true } });
    check("cannot check in on someone else's cycle", forbidden.status === 404);
  }
  {
    const cheat = await call(ctl.submitDailyCheckIn, await newUser(), { params: { cycleId: new mongoose.Types.ObjectId() }, body: { completed: true, carbonSavedKgCO2e: 999, ecoScoreReward: 999 } });
    check('unknown cycle -> 404', cheat.status === 404);
  }

  // ─────────────────────────────────────────────────────────────
  console.log('\n[6] Completion, rewards, duplicate protection');
  const fl = 'water_full_load_washing'; // requires 2 check-ins
  const flAct = ACTIVITY_CATALOG.find((a) => a.activityId === fl);
  {
    const before = await freshUser(user._id);
    const cid = cycles[fl]._id;
    // make "yesterday" valid by moving the cycle start back one day (endDate stays in the future)
    await UserActivityCycle.updateOne({ _id: cid }, { $set: { startDate: new Date(Date.now() - 2 * 86400000), endDate: new Date(Date.now() + 5 * 86400000) } });
    const r1 = await call(ctl.submitDailyCheckIn, user, { params: { cycleId: cid }, body: { completed: true, checkInDate: dateStr(-1) } });
    check('first check-in (yesterday) does not complete', r1.status === 200 && !r1.body.justCompleted);
    const r2 = await Promise.all([
      call(ctl.submitDailyCheckIn, user, { params: { cycleId: cid }, body: { completed: true } }),
      call(ctl.submitDailyCheckIn, user, { params: { cycleId: cid }, body: { completed: true } }),
    ]);
    const wins = r2.filter((x) => x.status === 200);
    check('final check-in completes the challenge exactly once', wins.length === 1 && wins[0].body.justCompleted === true);
    const rewards = wins[0].body.rewards;
    check('rewards equal the activity configuration (3 EcoScore / 14 GP)', rewards.ecoScore === flAct.ecoScoreReward && rewards.greenPoints === flAct.greenPointsReward, JSON.stringify(rewards));
    const after = await freshUser(user._id);
    check('GreenPoints awarded once', after.totalPoints === before.totalPoints + flAct.greenPointsReward, `${before.totalPoints} -> ${after.totalPoints}`);
    check('EcoScore awarded to the right category', after.ecoScore.water === (before.ecoScore.water || 0) + flAct.ecoScoreReward);
    check('one GreenPoint + one EcoScore transaction', (await GreenPointTransaction.countDocuments({ activityCycleId: cid })) === 1 && (await EcoScoreTransaction.countDocuments({ activityCycleId: cid })) === 1);
    const done = await UserActivityCycle.findById(cid);
    check('cycle completed with awarded values stored', done.status === 'completed' && done.greenPointsAwarded === flAct.greenPointsReward && done.ecoScoreAwarded === flAct.ecoScoreReward);
    check('carbon recorded for the cycle (2 successful check-ins)', near(done.carbonSavedKgCO2e, computeCarbonSaving(flAct) * 2, 1e-5), String(done.carbonSavedKgCO2e));
    console.log('DEBUG [6]:', { beforeCarbon: before.totalCarbonSavedKg, afterCarbon: after.totalCarbonSavedKg, doneCarbon: done.carbonSavedKgCO2e });
    check('user carbon total updated only on completion', near(after.totalCarbonSavedKg, (before.totalCarbonSavedKg || 0) + done.carbonSavedKgCO2e, 0.001), String(after.totalCarbonSavedKg));
    const late = await call(ctl.submitDailyCheckIn, user, { params: { cycleId: cid }, body: { completed: true, checkInDate: dateStr(-1) } });
    check('check-in on a completed cycle rejected', late.status === 400);
    const after2 = await freshUser(user._id);
    check('no extra reward after rejected check-in', after2.totalPoints === after.totalPoints);
  }
  {
    // Concurrent settle: a cycle that already met its requirement, read by many requests at once
    const u = await newUser();
    const act = ACTIVITY_CATALOG.find((a) => a.activityId === 'transport_combine_errands');
    const c = (await call(ctl.startActivity, u, { params: { activityId: act.activityId } })).body.cycle;
    await UserActivityCycle.updateOne({ _id: c._id }, { $set: { successfulCheckIns: act.requiredCheckIns, carbonSavedKgCO2e: 1.7 } });
    await Promise.all([1, 2, 3, 4].map(() => call(ctl.getActiveActivities, u)));
    const fin = await freshUser(u._id);
    check('4 concurrent reads settle a finished cycle with a single reward', fin.totalPoints === 50 + act.greenPointsReward, String(fin.totalPoints));
    check('single ledger entry', (await GreenPointTransaction.countDocuments({ activityCycleId: c._id })) === 1);
  }
  {
    // EcoScore cap (25 per category) keeps working
    const u = await newUser();
    await User.updateOne({ _id: u._id }, { $set: { 'ecoScore.transport': 22 } });
    const r = await call(ctl.alreadyAchievedActivity, u, { params: { activityId: 'transport_train_over_flight' }, body: { quantity: 300 } });
    const after = await freshUser(u._id);
    check('EcoScore capped at 25 per category', after.ecoScore.transport === 25 && after.ecoScore.total === 25, JSON.stringify(after.ecoScore));
    check('GreenPoints still awarded in full (55)', after.totalPoints === 50 + 55);
    check('one-time carbon uses provided quantity (300 km) server-side', near(r.body.rewards.carbonSavedKgCO2e, computeCarbonSaving(ACTIVITY_CATALOG.find((a) => a.activityId === 'transport_train_over_flight'), 300), 1e-4), String(r.body.rewards.carbonSavedKgCO2e));
  }

  // ─────────────────────────────────────────────────────────────
  console.log('\n[7] "Already achieved" rules');
  {
    const u = await newUser();
    const habit = await call(ctl.alreadyAchievedActivity, u, { params: { activityId: 'transport_walk_cycle' } });
    check('multi-day habit cannot be instantly achieved', habit.status === 400);
    const first = await call(ctl.alreadyAchievedActivity, u, { params: { activityId: 'energy_replace_led' }, body: { quantity: 3 } });
    check('one-time achieved -> 200 with LED rewards (4 EcoScore / 30 GP)', first.status === 200 && first.body.rewards.ecoScore === 4 && first.body.rewards.greenPoints === 30, JSON.stringify(first.body.rewards));
    const burst = await Promise.all(Array.from({ length: 4 }, () => call(ctl.alreadyAchievedActivity, u, { params: { activityId: 'energy_replace_led' } })));
    check('repeat/concurrent duplicates all rejected', burst.every((x) => x.status === 400));
    const fin = await freshUser(u._id);
    check('rewarded exactly once', fin.totalPoints === 50 + 30);
    const race = await newUser();
    const rr = await Promise.all(Array.from({ length: 5 }, () => call(ctl.alreadyAchievedActivity, race, { params: { activityId: 'water_report_leaking_taps' } })));
    check('5 simultaneous first-time requests -> exactly one reward', rr.filter((x) => x.status === 200).length === 1);
    check('only one GreenPoint transaction for it', (await GreenPointTransaction.countDocuments({ userId: race._id, activityId: 'water_report_leaking_taps' })) === 1);
    const restart = await call(ctl.startActivity, u, { params: { activityId: 'energy_replace_led' } });
    check('non-recurring one-time cannot be restarted', restart.status === 400);
    await call(ctl.dismissActivity, u, { params: { activityId: 'transport_carpool' } });
    check('dismiss recorded', Boolean(await UserDismissedActivity.findOne({ userId: u._id, activityId: 'transport_carpool' })));
  }

  // ─────────────────────────────────────────────────────────────
  console.log('\n[8] Restart rules (completed / expired)');
  {
    const u = await newUser();
    const id = 'energy_switch_off_lights';
    const c1 = (await call(ctl.startActivity, u, { params: { activityId: id } })).body.cycle;
    await UserActivityCycle.updateOne({ _id: c1._id }, { $set: { successfulCheckIns: 6 } });
    await call(ctl.getActiveActivities, u); // settles it
    const sameDay = await call(ctl.startActivity, u, { params: { activityId: id } });
    check('completed today -> restart blocked until tomorrow', sameDay.status === 400);
    const detailToday = await call(ctl.getActivityDetail, u, { params: { activityId: id } });
    check('detail says completed + canRestartTomorrow', detailToday.body.data.userStatus === 'completed' && detailToday.body.data.canRestartTomorrow === true && detailToday.body.data.canRestart === false);
    await UserActivityCycle.updateOne({ _id: c1._id }, { $set: { completedAt: new Date(Date.now() - 86400000 - 60000) } });
    const nextDay = await call(ctl.startActivity, u, { params: { activityId: id } });
    check('next day restart -> new cycle from Day 0 (cycle #2)', nextDay.status === 201 && nextDay.body.cycle.cycleNumber === 2 && nextDay.body.cycle.currentDayIndex === 0);

    // Expire it
    await UserActivityCycle.updateOne({ _id: nextDay.body.cycle._id }, { $set: { endDate: new Date(Date.now() - 1000), startDate: new Date(Date.now() - 8 * 86400000) } });
    const list = await call(ctl.getActivities, u);
    const row = list.body.data.find((a) => a.activityId === id);
    check('overdue cycle shows as expired (even though an older cycle was completed)', row.userStatus === 'expired' && row.canRestart === true, row.userStatus);
    const late = await call(ctl.submitDailyCheckIn, u, { params: { cycleId: nextDay.body.cycle._id }, body: { completed: true } });
    check('check-in on expired cycle rejected', late.status === 400);
    const expiredList = await call(ctl.getExpiredActivities, u);
    check('expired history lists it', expiredList.body.count === 1);
    const afterExpire = await freshUser(u._id);
    check('expiry awards nothing extra', afterExpire.totalPoints === 50 + ACTIVITY_CATALOG.find((a) => a.activityId === id).greenPointsReward);
    const restart = await call(ctl.startActivity, u, { params: { activityId: id } });
    check('expired -> immediate restart from Day 0 (cycle #3)', restart.status === 201 && restart.body.cycle.cycleNumber === 3);
    const hist = await call(ctl.getCompletedActivities, u);
    check('completed history preserved', hist.body.count === 1);
  }

  console.log(`\n${failed === 0 ? '🎉' : '💥'} Activities suite: ${passed} passed, ${failed} failed`);
  if (failed) console.log('Failures:\n - ' + failures.join('\n - '));

  await mongoose.disconnect();
  await mongod.stop();
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
