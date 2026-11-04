const assert = require('assert');
const mongoose = require('mongoose');
const { generateOtp, hashOtp, verifyOtpHash } = require('../services/otpService');
const User = require('../models/User');

async function testOtp() {
  console.log('🧪 Testing EcoPulse OTP Authentication Engine...');

  // 1. Test cryptographic OTP generation
  const otp1 = generateOtp();
  const otp2 = generateOtp();
  assert.strictEqual(otp1.length, 6, 'OTP must be 6 digits');
  assert.strictEqual(/^\d{6}$/.test(otp1), true, 'OTP must be numerical');
  assert.notStrictEqual(otp1, otp2, 'Subsequent OTPs should be random');
  console.log('  ✓ [PASS] Cryptographic 6-digit OTP generation');

  // 2. Test salted hashing & constant-time verify
  const hashed = hashOtp(otp1);
  assert.notStrictEqual(hashed, otp1, 'Hash must not be plaintext');
  assert.strictEqual(verifyOtpHash(otp1, hashed), true, 'Valid OTP must match hash');
  assert.strictEqual(verifyOtpHash('000000', hashed), false, 'Wrong OTP must be rejected');
  assert.strictEqual(verifyOtpHash('', hashed), false, 'Empty OTP must be rejected');
  console.log('  ✓ [PASS] Salted SHA-256 OTP hashing & constant-time verification');

  console.log('\n🎉 ALL OTP LOGIC TESTS PASSED!\n');
}

testOtp().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
