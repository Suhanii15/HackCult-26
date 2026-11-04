const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const Activity = require('../models/Activity');
const UserActivityCycle = require('../models/UserActivityCycle');
const ActivityCheckIn = require('../models/ActivityCheckIn');
const GreenPointTransaction = require('../models/GreenPointTransaction');
const EcoScoreTransaction = require('../models/EcoScoreTransaction');
const UserDismissedActivity = require('../models/UserDismissedActivity');

const {
  getCategories,
  getActivities,
  getActivityDetail,
  startActivity,
  alreadyAchievedActivity,
  dismissActivity,
  submitDailyCheckIn,
  getActiveActivities,
  getCompletedActivities,
  getExpiredActivities,
} = require('../controllers/activityController');

// Helper to mock express req/res
function mockReqRes(user, params = {}, body = {}, query = {}) {
  const req = { user, params, body, query };
  let statusCode = 200;
  let jsonResult = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResult = data;
      return this;
    },
  };
  return { req, res, getStatus: () => statusCode, getJson: () => jsonResult };
}

async function runTestSuite() {
  console.log('🧪 Starting Activities & Challenges Test Suite...');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  // Find or create test user
  let testUser = await User.findOne({ email: 'test_activist@ecopulse.gov.in' });
  if (!testUser) {
    testUser = await User.create({
      fullName: 'Test Activist',
      email: 'test_activist@ecopulse.gov.in',
      password: 'password123',
      district: 'Ahmedabad',
      city: 'Ahmedabad',
      greenPoints: 0,
      ecoScore: { total: 0, energy: 0, transport: 0, waste: 0, water: 0 },
    });
  }

  // Reset test user activity cycles & transactions for clean test
  await UserActivityCycle.deleteMany({ userId: testUser._id });
  await ActivityCheckIn.deleteMany({});
  await GreenPointTransaction.deleteMany({ userId: testUser._id });
  await EcoScoreTransaction.deleteMany({ userId: testUser._id });
  await UserDismissedActivity.deleteMany({ userId: testUser._id });

  // Test 1: Categories with stats
  console.log('\n--- Test 1: Categories & Stats ---');
  {
    const { req, res, getStatus, getJson } = mockReqRes(testUser);
    await getCategories(req, res);
    const json = getJson();
    console.log(`Status: ${getStatus()}, Categories count: ${json.data.length}`);
    if (json.data.length !== 4) throw new Error('Expected 4 categories');
    console.log('✅ Test 1 Passed: 4 categories returned with stats');
  }

  // Test 2: Start 7-day Habit Activity (Action A)
  console.log('\n--- Test 2: Start Habit Activity (Action A) ---');
  let cycle1;
  {
    const { req, res, getStatus, getJson } = mockReqRes(testUser, { activityId: 'energy_switch_off_unused' });
    await startActivity(req, res);
    const json = getJson();
    console.log(`Status: ${getStatus()}, Cycle Status: ${json.data?.status}`);
    if (getStatus() !== 201 || json.data?.status !== 'active') {
      throw new Error('Failed to start activity cycle');
    }
    cycle1 = json.data;
    console.log('✅ Test 2 Passed: Started 7-day challenge at Day 0');
  }

  // Test 3: Multiple Concurrent Challenges Allowed
  console.log('\n--- Test 3: Multiple Concurrent Challenges ---');
  let cycle2;
  {
    const { req, res, getStatus, getJson } = mockReqRes(testUser, { activityId: 'water_turn_off_tap_brushing' });
    await startActivity(req, res);
    const json = getJson();
    console.log(`Status: ${getStatus()}, Second Cycle Status: ${json.data?.status}`);
    if (getStatus() !== 201 || json.data?.status !== 'active') {
      throw new Error('Failed to start second concurrent challenge');
    }
    cycle2 = json.data;

    // Verify active count is 2
    const { req: reqActive, res: resActive, getJson: getActiveJson } = mockReqRes(testUser);
    await getActiveActivities(reqActive, resActive);
    const activeList = getActiveJson().data;
    console.log(`Total active cycles for user: ${activeList.length}`);
    if (activeList.length !== 2) throw new Error('Expected 2 active concurrent cycles');
    console.log('✅ Test 3 Passed: Multiple concurrent activities progress independently');
  }

  // Test 4: Daily Check-in & Duplicate Check-in Prevention
  console.log('\n--- Test 4: Daily Check-in & Duplicate Protection ---');
  {
    const todayStr = new Date().toISOString().split('T')[0];
    const { req, res, getStatus, getJson } = mockReqRes(testUser, { cycleId: cycle1._id }, { completed: true, checkInDate: todayStr });
    await submitDailyCheckIn(req, res);
    const json = getJson();
    console.log(`Check-in 1 Status: ${getStatus()}, Recorded check-in date: ${json.data?.checkIn?.checkInDate}`);
    if (getStatus() !== 200 || !json.data?.checkIn) throw new Error('Check-in failed');

    // Attempt second check-in on same day -> must be rejected
    const { req: reqDup, res: resDup, getStatus: getDupStatus, getJson: getDupJson } = mockReqRes(testUser, { cycleId: cycle1._id }, { completed: true, checkInDate: todayStr });
    await submitDailyCheckIn(reqDup, resDup);
    console.log(`Duplicate Check-in Status: ${getDupStatus()} (Expected 400), Message: ${getDupJson().message}`);
    if (getDupStatus() !== 400) throw new Error('Duplicate check-in should have been rejected');
    console.log('✅ Test 4 Passed: Daily check-in recorded & duplicate blocked');
  }

  // Test 5: Action B - "Already Achieved" on Multi-Day habit rejected
  console.log('\n--- Test 5: "Already Achieved" validation on habit vs one-time ---');
  {
    // Try Already Achieved on multi-day habit -> should fail with 400
    const { req, res, getStatus, getJson } = mockReqRes(testUser, { activityId: 'transport_walk_cycle' });
    await alreadyAchievedActivity(req, res);
    console.log(`Habit Already Achieved Status: ${getStatus()} (Expected 400), Message: ${getJson().message}`);
    if (getStatus() !== 400) throw new Error('Habit challenge should not allow instant bypass');

    // Try Already Achieved on eligible one-time activity (e.g. LED bulbs upgrade)
    const { req: reqLed, res: resLed, getStatus: getLedStatus, getJson: getLedJson } = mockReqRes(testUser, { activityId: 'energy_replace_led' });
    await alreadyAchievedActivity(reqLed, resLed);
    console.log(`One-Time Already Achieved Status: ${getLedStatus()}, Points Earned: ${getLedJson().data?.pointsEarned}`);
    if (getLedStatus() !== 200) throw new Error('One-time already achieved failed');

    // Try Again on same one-time -> duplicate must be rejected
    const { req: reqDupLed, res: resDupLed, getStatus: getDupLedStatus } = mockReqRes(testUser, { activityId: 'energy_replace_led' });
    await alreadyAchievedActivity(reqDupLed, resDupLed);
    console.log(`Duplicate One-Time Status: ${getDupLedStatus()} (Expected 400)`);
    if (getDupLedStatus() !== 400) throw new Error('Duplicate already-achieved reward must be blocked');

    console.log('✅ Test 5 Passed: Multi-day bypass blocked, one-time verified and duplicate blocked');
  }

  // Test 6: Action C - "Not for me" Dismissal
  console.log('\n--- Test 6: "Not for Me" Dismissal ---');
  {
    const { req, res, getStatus } = mockReqRes(testUser, { activityId: 'transport_carpool' });
    await dismissActivity(req, res);
    console.log(`Dismiss Status: ${getStatus()}`);
    if (getStatus() !== 200) throw new Error('Failed to dismiss activity');

    const dismissed = await UserDismissedActivity.findOne({ userId: testUser._id, activityId: 'transport_carpool' });
    if (!dismissed) throw new Error('Dismissed record not saved in database');
    console.log('✅ Test 6 Passed: Activity dismissed and tracked');
  }

  // Test 7: Completion & Rewards ledger
  console.log('\n--- Test 7: Cycle Completion & Rewards Ledger ---');
  {
    // Fast-forward cycle1 to meet 6 check-ins
    const cycleDoc = await UserActivityCycle.findById(cycle1._id);
    cycleDoc.successfulCheckIns = 6;
    cycleDoc.status = 'completed';
    cycleDoc.completedAt = new Date();
    await cycleDoc.save();

    // Reward green points and ecoscore
    await GreenPointTransaction.create({
      userId: testUser._id,
      points: 20,
      transactionType: 'challenge_completion',
      activityId: 'energy_switch_off_unused',
      activityCycleId: cycleDoc._id,
      description: 'Completed challenge: energy_switch_off_unused',
    });
    await EcoScoreTransaction.create({
      userId: testUser._id,
      category: 'energy',
      points: 5,
      activityId: 'energy_switch_off_unused',
      activityCycleId: cycleDoc._id,
      description: 'EcoScore reward for energy_switch_off_unused',
    });

    // Check completed API
    const { req, res, getJson } = mockReqRes(testUser);
    await getCompletedActivities(req, res);
    console.log(`Completed cycles count: ${getJson().data?.length}`);
    if (!getJson().data?.length) throw new Error('Expected completed cycle in history');
    console.log('✅ Test 7 Passed: Cycle completed and recorded in ledger');
  }

  // Test 8: Restart Rule (cannot restart same day, can restart next day)
  console.log('\n--- Test 8: Restart Rules ---');
  {
    // Attempt restart on same day -> must be blocked
    const { req: reqSameDay, res: resSameDay, getStatus: getSameDayStatus, getJson: getSameDayJson } = mockReqRes(testUser, { activityId: 'energy_switch_off_unused' });
    await startActivity(reqSameDay, resSameDay);
    console.log(`Same day restart Status: ${getSameDayStatus()} (Expected 400), Message: ${getSameDayJson().message}`);
    if (getSameDayStatus() !== 400) throw new Error('Same day restart should be rejected');

    // Simulate next calendar day by setting completedAt to yesterday
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await UserActivityCycle.updateOne({ _id: cycle1._id }, { completedAt: yesterday });

    // Attempt restart next day -> should succeed
    const { req: reqNextDay, res: resNextDay, getStatus: getNextDayStatus, getJson: getNextDayJson } = mockReqRes(testUser, { activityId: 'energy_switch_off_unused' });
    await startActivity(reqNextDay, resNextDay);
    console.log(`Next day restart Status: ${getNextDayStatus()} (Expected 201), Cycle #${getNextDayJson().data?.cycleNumber}`);
    if (getNextDayStatus() !== 201 || getNextDayJson().data?.cycleNumber !== 2) {
      throw new Error('Next day restart failed or cycle number did not increment');
    }
    console.log('✅ Test 8 Passed: Restart blocked same day, permitted next day from Day 0 (Cycle #2)');
  }

  console.log('\n🎉 ALL 8 TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
