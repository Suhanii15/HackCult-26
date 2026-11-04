/**
 * testCommunityFullFlow.js
 * Comprehensive End-to-End automated test suite for EcoPulse Global Community Data Integration
 */

const BASE_URL = process.env.API_BASE_URL || 'http://10.100.252.167:5000/api/v1';

async function req(endpoint, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawText: text };
    }
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    console.error(`Network error requesting ${endpoint}:`, err.message);
    return { status: 0, ok: false, data: { error: err.message } };
  }
}

async function getOrCreateUser(email, fullName, district) {
  // Try login first if already registered
  // Try login first if already registered
  const login = await req('/auth/login', {
    method: 'POST',
    body: {
      identifier: email,
      password: 'TestPassword123!',
    },
  });

  if (login.ok && login.data.token) {
    return { token: login.data.token, user: login.data.user };
  }

  // Register
  const reg = await req('/auth/register', {
    method: 'POST',
    body: {
      fullName,
      identifier: email,
      password: 'TestPassword123!',
      district,
      city: district,
    },
  });

  if (reg.data?.devOtp) {
    const verify = await req('/auth/verify-otp', {
      method: 'POST',
      body: {
        identifier: email,
        otp: reg.data.devOtp,
      },
    });

    if (verify.ok && verify.data.token) {
      return { token: verify.data.token, user: verify.data.user };
    }
  }

  throw new Error(`Failed to authenticate ${email}: ${JSON.stringify(login.data || reg.data)}`);
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runCommunityTestSuite() {
  console.log('====================================================');
  console.log('🚀 ECOPULSE COMMUNITY E2E VERIFICATION TEST SUITE');
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  // STEP 0: Authenticate 3 test users
  console.log('--- Step 0: Preparing Test Users ---');
  const userA = await getOrCreateUser('user_a_community@ecopulse.test', 'Aarav Patel', 'Ahmedabad');
  console.log('User A authenticated:', userA.user?.fullName || 'Aarav Patel');

  const userB = await getOrCreateUser('user_b_community@ecopulse.test', 'Bhavna Shah', 'Surat');
  console.log('User B authenticated:', userB.user?.fullName || 'Bhavna Shah');

  const userC = await getOrCreateUser('user_c_community@ecopulse.test', 'Chirag Desai', 'Vadodara');
  console.log('User C authenticated:', userC.user?.fullName || 'Chirag Desai');

  let testPostId = null;

  // STEP 1: User A creates a post
  console.log('\n--- Scenario 1: User A creates post ---');
  const createRes = await req('/community/posts', {
    method: 'POST',
    token: userA.token,
    body: {
      title: 'Solar Panels in Ahmedabad Bopal',
      content: 'Installed 5kW rooftop panels. Zero net grid consumption on sunny days!',
      tag: 'Energy',
    },
  });
  assert(createRes.status === 201, `Status is 201 Created (got ${createRes.status})`);
  assert(createRes.data.success === true, 'Response indicates success');
  assert(createRes.data.data.title === 'Solar Panels in Ahmedabad Bopal', 'Post title matches');
  assert(createRes.data.data.authorName === (userA.user?.fullName || 'Aarav Patel'), 'Author name matches User A');
  testPostId = createRes.data.data._id;
  assert(!!testPostId, `Created post ID: ${testPostId}`);

  // STEP 2: User B sees User A's post in global feed
  console.log("\n--- Scenario 2: User B sees User A's post ---");
  const feedB = await req('/community/posts?sort=recent', {
    method: 'GET',
    token: userB.token,
  });
  assert(feedB.status === 200, `User B fetched feed (status ${feedB.status})`);
  const postFoundB = feedB.data.data.find((p) => p._id === testPostId);
  assert(!!postFoundB, "User B found User A's post in global community feed");
  assert(postFoundB.isOwner === false, 'isOwner is false for User B');
  assert(postFoundB.isLiked === false, 'isLiked is false for User B initially');

  // STEP 3: User C also sees it
  console.log("\n--- Scenario 3: User C sees User A's post ---");
  const feedC = await req('/community/posts?sort=recent', {
    method: 'GET',
    token: userC.token,
  });
  const postFoundC = feedC.data.data.find((p) => p._id === testPostId);
  assert(!!postFoundC, "User C found User A's post in global community feed");

  // STEP 4: User B likes the post -> count increments
  console.log('\n--- Scenario 4: User B likes post ---');
  const likeRes = await req(`/community/posts/${testPostId}/like`, {
    method: 'POST',
    token: userB.token,
  });
  assert(likeRes.status === 200, `User B liked post (status ${likeRes.status})`);
  assert(likeRes.data.likesCount === 1, `likesCount is 1 (got ${likeRes.data.likesCount})`);
  assert(likeRes.data.isLiked === true, 'isLiked is true for User B');

  // Verify User A now sees the updated like count
  const feedA = await req('/community/posts?sort=recent', {
    method: 'GET',
    token: userA.token,
  });
  const postFoundA = feedA.data.data.find((p) => p._id === testPostId);
  assert(postFoundA.likesCount === 1, `User A sees updated like count of 1`);
  assert(postFoundA.isOwner === true, 'isOwner is true for User A');

  // STEP 5: User B cannot duplicate like
  console.log('\n--- Scenario 5: User B cannot duplicate like ---');
  const dupLikeRes = await req(`/community/posts/${testPostId}/like`, {
    method: 'POST',
    token: userB.token,
  });
  assert(dupLikeRes.status === 409, `Duplicate like rejected with 409 (got ${dupLikeRes.status})`);

  // STEP 6: User B unlikes -> count decrements
  console.log('\n--- Scenario 6: User B unlikes post ---');
  const unlikeRes = await req(`/community/posts/${testPostId}/like`, {
    method: 'DELETE',
    token: userB.token,
  });
  assert(unlikeRes.status === 200, `Unlike returned 200`);
  assert(unlikeRes.data.likesCount === 0, `likesCount decremented to 0`);
  assert(unlikeRes.data.isLiked === false, 'isLiked is false for User B');

  // Re-like by User B for sorting tests later
  await req(`/community/posts/${testPostId}/like`, { method: 'POST', token: userB.token });

  // STEP 7: User C celebrates -> celebrate count increments
  console.log('\n--- Scenario 7: User C celebrates post ---');
  const celRes = await req(`/community/posts/${testPostId}/celebrate`, {
    method: 'POST',
    token: userC.token,
  });
  assert(celRes.status === 200, `Celebrate returned 200`);
  assert(celRes.data.celebratesCount === 1, `celebratesCount is 1`);
  assert(celRes.data.isCelebrated === true, 'isCelebrated is true for User C');

  // STEP 8: User C cannot duplicate celebrate
  console.log('\n--- Scenario 8: User C cannot duplicate celebrate ---');
  const dupCelRes = await req(`/community/posts/${testPostId}/celebrate`, {
    method: 'POST',
    token: userC.token,
  });
  assert(dupCelRes.status === 409, `Duplicate celebration rejected with 409`);

  // User C removes celebration
  const unCelRes = await req(`/community/posts/${testPostId}/celebrate`, {
    method: 'DELETE',
    token: userC.token,
  });
  assert(unCelRes.status === 200, 'Remove celebration returned 200');
  assert(unCelRes.data.celebratesCount === 0, 'celebratesCount decremented to 0');
  assert(unCelRes.data.isCelebrated === false, 'isCelebrated is false for User C');

  // STEP 9: User A edits own post
  console.log('\n--- Scenario 9: User A edits own post ---');
  const editRes = await req(`/community/posts/${testPostId}`, {
    method: 'PUT',
    token: userA.token,
    body: {
      title: 'Solar Panels in Ahmedabad Bopal [Updated]',
      content: 'Installed 5kW rooftop panels. System generated 28 kWh today!',
      tag: 'Energy',
    },
  });
  assert(editRes.status === 200, 'Edit returned 200');
  assert(editRes.data.data.title === 'Solar Panels in Ahmedabad Bopal [Updated]', 'Title updated');

  // STEP 10: User B cannot edit User A's post (403)
  console.log("\n--- Scenario 10: User B cannot edit User A's post ---");
  const badEditRes = await req(`/community/posts/${testPostId}`, {
    method: 'PUT',
    token: userB.token,
    body: {
      title: 'Hacked title by User B',
      content: 'Should not succeed',
      tag: 'Energy',
    },
  });
  assert(badEditRes.status === 403, `Non-owner edit forbidden with 403 (got ${badEditRes.status})`);

  // STEP 11: User B cannot delete User A's post (403)
  console.log("\n--- Scenario 11: User B cannot delete User A's post ---");
  const badDelRes = await req(`/community/posts/${testPostId}`, {
    method: 'DELETE',
    token: userB.token,
  });
  assert(badDelRes.status === 403, `Non-owner delete forbidden with 403 (got ${badDelRes.status})`);

  // STEP 12: Sorting Verification
  console.log('\n--- Scenario 12: Sorting Verification ---');
  // Sort by recent
  const sortRecent = await req('/community/posts?sort=recent&limit=5', { method: 'GET', token: userA.token });
  assert(sortRecent.status === 200, 'Sort recent returns 200');
  assert(Array.isArray(sortRecent.data.data), 'Returns data array');

  // Sort by liked
  const sortLiked = await req('/community/posts?sort=liked&limit=5', { method: 'GET', token: userA.token });
  assert(sortLiked.status === 200, 'Sort liked returns 200');

  // Sort by celebrated
  const sortCel = await req('/community/posts?sort=celebrated&limit=5', { method: 'GET', token: userA.token });
  assert(sortCel.status === 200, 'Sort celebrated returns 200');

  // Filter My Posts
  const sortMineA = await req('/community/posts?sort=mine', { method: 'GET', token: userA.token });
  assert(sortMineA.status === 200, 'Sort mine returns 200');
  const allMine = sortMineA.data.data.every((p) => p.isOwner === true);
  assert(allMine, 'All posts in sort=mine have isOwner === true');

  // STEP 13: Pagination Verification
  console.log('\n--- Scenario 13: Pagination Verification ---');
  const page1 = await req('/community/posts?page=1&limit=2', { method: 'GET', token: userA.token });
  assert(page1.status === 200, 'Page 1 returns 200');
  assert(page1.data.pagination.page === 1, 'Pagination page is 1');
  assert(page1.data.pagination.limit === 2, 'Pagination limit is 2');
  assert(page1.data.data.length <= 2, 'Returns at most 2 posts per page');

  // STEP 14: User A deletes own post
  console.log('\n--- Scenario 14: User A deletes own post ---');
  const delRes = await req(`/community/posts/${testPostId}`, {
    method: 'DELETE',
    token: userA.token,
  });
  assert(delRes.status === 200, 'User A delete returned 200');
  assert(delRes.data.success === true, 'Delete was successful');

  // STEP 15: Post no longer appears in feed
  console.log('\n--- Scenario 15: Deleted post disappeared from feed ---');
  const feedAfterDel = await req('/community/posts?sort=recent', {
    method: 'GET',
    token: userA.token,
  });
  const deletedCheck = feedAfterDel.data.data.find((p) => p._id === testPostId);
  assert(!deletedCheck, 'Deleted post is no longer present in feed');

  console.log('\n====================================================');
  console.log('🎉 ALL 15 COMMUNITY TEST SCENARIOS PASSED PERFECTLY!');
  console.log('====================================================\n');
}

runCommunityTestSuite().catch((err) => {
  console.error('\n❌ TEST SUITE RUNNER ABORTED WITH ERROR:', err);
  process.exit(1);
});
