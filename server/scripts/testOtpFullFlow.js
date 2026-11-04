const assert = require('assert');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const {
  register,
  verifyOtp,
  resendOtp,
  login,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return res;
}

async function runFullFlow() {
  console.log('🧪 Running EcoPulse End-to-End OTP Verification Flow...');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mission-life';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  const testEmail = `test_otp_${Date.now()}@ecopulse.gov.in`;
  const testPassword = 'EcoPassword123!';

  // Step 1: Register new account
  console.log('1. Submitting Registration for:', testEmail);
  const regReq = {
    body: {
      fullName: 'Aarav Patel',
      email: testEmail,
      password: testPassword,
      district: 'Ahmedabad',
      city: 'Ahmedabad',
    },
  };
  const regRes = mockRes();
  await register(regReq, regRes, (err) => { if (err) throw err; });

  assert.strictEqual(regRes.statusCode, 200, 'Registration should return 200');
  assert.strictEqual(regRes.data.success, true, 'Registration success should be true');
  assert.strictEqual(regRes.data.requiresOtp, true, 'Registration must require OTP');
  assert.strictEqual(typeof regRes.data.devOtp, 'string', 'Development OTP should be present in dev mode');
  assert.strictEqual(regRes.data.devOtp.length, 6, 'OTP must be 6 digits');
  const generatedOtp = regRes.data.devOtp;
  console.log('  ✓ [PASS] Signup submitted, account in unverified state, OTP generated.');

  // Step 2: Verify user in DB is unverified and has NO plaintext OTP
  const dbUser = await User.findOne({ email: testEmail }).select(
    '+password +verificationOtpHash +verificationOtpExpires +verificationOtpAttempts'
  );
  assert.strictEqual(dbUser.isVerified, false, 'User must be isVerified=false');
  assert.strictEqual(dbUser.verificationOtpHash !== generatedOtp, true, 'Stored OTP must be hashed, not plaintext');
  assert.strictEqual(dbUser.verificationOtpHash.length, 64, 'SHA-256 hash must be 64 hex characters');
  console.log('  ✓ [PASS] Database verified: isVerified=false, plaintext OTP never stored.');

  // Step 3: Test that unverified account is blocked by protect middleware
  const mockProtectedReq = {
    headers: { authorization: `Bearer ${dbUser.getSignedJwtToken()}` },
  };
  const mockProtectedRes = mockRes();
  let nextCalled = false;
  await protect(mockProtectedReq, mockProtectedRes, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, false, 'Unverified user MUST NOT pass protect middleware');
  assert.strictEqual(mockProtectedRes.statusCode, 403, 'Unverified user gets 403 Forbidden');
  assert.strictEqual(mockProtectedRes.data.isUnverified, true);
  console.log('  ✓ [PASS] Unverified account blocked from protected endpoints.');

  // Step 4: Test incorrect OTP rejection
  console.log('2. Testing incorrect OTP rejection...');
  const badOtpReq = {
    body: {
      identifier: testEmail,
      otp: '000000',
    },
  };
  const badOtpRes = mockRes();
  await verifyOtp(badOtpReq, badOtpRes, (err) => { if (err) throw err; });
  assert.strictEqual(badOtpRes.statusCode, 400, 'Invalid OTP should return 400');
  assert.strictEqual(badOtpRes.data.success, false);
  console.log('  ✓ [PASS] Invalid OTP rejected with proper error message.');

  // Step 5: Test correct OTP verification
  console.log('3. Submitting valid OTP:', generatedOtp);
  const goodOtpReq = {
    body: {
      identifier: testEmail,
      otp: generatedOtp,
    },
  };
  const goodOtpRes = mockRes();
  await verifyOtp(goodOtpReq, goodOtpRes, (err) => { if (err) throw err; });
  assert.strictEqual(goodOtpRes.statusCode, 200, 'Valid OTP must return 200');
  assert.strictEqual(goodOtpRes.data.success, true);
  assert.strictEqual(typeof goodOtpRes.data.token, 'string', 'Should return signed JWT token');
  assert.strictEqual(goodOtpRes.data.user.isVerified, true, 'User is now verified');
  console.log('  ✓ [PASS] OTP verified successfully, JWT token generated.');

  // Step 6: Verify DB state after verification
  const verifiedDbUser = await User.findOne({ email: testEmail }).select(
    '+verificationOtpHash +verificationOtpExpires +verificationOtpAttempts'
  );
  assert.strictEqual(verifiedDbUser.isVerified, true);
  assert.strictEqual(verifiedDbUser.verificationOtpHash, undefined, 'OTP hash must be wiped after verification');
  console.log('  ✓ [PASS] Database state confirmed: user verified, OTP hash invalidated.');

  // Step 7: Test Login with verified credentials
  console.log('4. Testing login for verified account...');
  const loginReq = {
    body: {
      identifier: testEmail,
      password: testPassword,
    },
  };
  const loginRes = mockRes();
  await login(loginReq, loginRes, (err) => { if (err) throw err; });
  assert.strictEqual(loginRes.statusCode, 200);
  assert.strictEqual(loginRes.data.success, true);
  assert.strictEqual(typeof loginRes.data.token, 'string');
  console.log('  ✓ [PASS] Verified user logs in normally.');

  // Clean up test user
  await User.deleteOne({ email: testEmail });
  console.log('\n🎉 ALL 7 E2E OTP AUTHENTICATION TESTS PASSED!\n');

  await mongoose.disconnect();
}

runFullFlow().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
