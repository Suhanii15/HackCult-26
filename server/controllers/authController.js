const User = require('../models/User');
const {
  OTP_EXPIRY_MS,
  RESEND_INTERVAL_MS,
  MAX_OTP_ATTEMPTS,
  generateOtp,
  hashOtp,
  verifyOtpHash,
  dispatchOtp,
} = require('../services/otpService');

// Helper to format user response without password
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      district: user.district,
      city: user.city,
      isVerified: user.isVerified !== false,
      onboardingCompleted: user.onboardingCompleted,
      hasCompletedOnboarding: Boolean(user.onboardingCompleted),
      onboardingMode: user.onboardingMode,
      totalPoints: user.totalPoints,
      ecoScore: user.ecoScore,
      currentStreakDays: user.currentStreakDays,
      baselineAnnualCO2Kg: user.baselineAnnualCO2Kg,
      household: user.household,
    },
  });
};

// @desc    Register a new user (generates and sends OTP)
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, identifier, password, phone, district, city } = req.body;

    const rawIdentifier = (email || identifier || '').trim();
    const userEmail = rawIdentifier.toLowerCase();
    const cleanName = (fullName || '').trim();

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name.',
      });
    }

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address or 10-digit mobile number.',
      });
    }

    // Validate email or mobile format
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail);
    const isPhone = /^[+]?[0-9\s-]{10,15}$/.test(rawIdentifier);
    if (!isEmail && !isPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address or 10-digit mobile number.',
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedPhone = phone
      ? String(phone).trim()
      : isPhone
      ? rawIdentifier.replace(/[\s-]/g, '')
      : undefined;

    // Check if user already exists by email or phone
    const duplicateQuery = normalizedPhone
      ? { $or: [{ email: userEmail }, { phone: normalizedPhone }] }
      : { email: userEmail };

    let user = await User.findOne(duplicateQuery).select(
      '+verificationOtpHash +verificationOtpExpires +verificationOtpAttempts +otpLastSentAt'
    );

    // If an existing VERIFIED account exists, reject duplicate registration
    if (user && user.isVerified !== false) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email or mobile number already exists. Please log in instead.',
      });
    }

    // Generate fresh cryptographically secure 6-digit OTP
    const otp = generateOtp();
    const hashed = hashOtp(otp);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

    if (user && user.isVerified === false) {
      // User started registration earlier but did not complete OTP verification
      // Apply resend rate limit (minimum 60s cooldown)
      if (user.otpLastSentAt && (now.getTime() - user.otpLastSentAt.getTime() < RESEND_INTERVAL_MS)) {
        const waitSec = Math.ceil((RESEND_INTERVAL_MS - (now.getTime() - user.otpLastSentAt.getTime())) / 1000);
        return res.status(429).json({
          success: false,
          requiresOtp: true,
          identifier: userEmail,
          message: `Please wait ${waitSec} second(s) before requesting a new verification code.`,
        });
      }

      user.fullName = cleanName;
      user.password = password; // Will be re-hashed by pre-save
      user.verificationOtpHash = hashed;
      user.verificationOtpExpires = expiresAt;
      user.verificationOtpAttempts = 0;
      user.otpLastSentAt = now;
      if (district) user.district = district;
      if (city) user.city = city;
      await user.save();
    } else {
      // Create new unverified user
      user = await User.create({
        fullName: cleanName,
        email: userEmail,
        phone: normalizedPhone,
        password,
        district: district || 'Ahmedabad',
        city: city || 'Ahmedabad',
        totalPoints: 50, // Starting welcome bonus points
        isVerified: false,
        verificationOtpHash: hashed,
        verificationOtpExpires: expiresAt,
        verificationOtpAttempts: 0,
        otpLastSentAt: now,
      });
    }

    // Dispatch OTP via email or SMS
    const delivery = await dispatchOtp(userEmail, otp);

    res.status(200).json({
      success: true,
      requiresOtp: true,
      identifier: userEmail,
      message: 'Verification code sent to your registered email or mobile number.',
      // Include devOtp in non-production environments as a convenience backup
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify 6-digit OTP during signup
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { identifier, otp } = req.body;
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();

    if (!cleanId) {
      return res.status(400).json({
        success: false,
        message: 'Identifier is required.',
      });
    }

    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit verification code.',
      });
    }

    // Find user with verification fields
    const user = await User.findOne({
      $or: [{ email: cleanId }, { phone: cleanId }],
    }).select('+verificationOtpHash +verificationOtpExpires +verificationOtpAttempts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registration pending for this email or mobile number.',
      });
    }

    if (user.isVerified === true) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. Please log in.',
      });
    }

    // Check if attempts exceeded
    if (user.verificationOtpAttempts >= MAX_OTP_ATTEMPTS) {
      user.verificationOtpHash = undefined;
      user.verificationOtpExpires = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. Please tap Resend to request a new verification code.',
      });
    }

    // Check expiry
    if (!user.verificationOtpExpires || user.verificationOtpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    // Constant-time hash verification
    const isMatch = verifyOtpHash(cleanOtp, user.verificationOtpHash);
    if (!isMatch) {
      user.verificationOtpAttempts = (user.verificationOtpAttempts || 0) + 1;
      await user.save();
      const remaining = MAX_OTP_ATTEMPTS - user.verificationOtpAttempts;
      return res.status(400).json({
        success: false,
        message: remaining > 0
          ? `Invalid verification code. ${remaining} attempt(s) remaining.`
          : 'Too many incorrect attempts. Please request a new code.',
      });
    }

    // OTP matched successfully! Activate account
    user.isVerified = true;
    user.verificationOtpHash = undefined;
    user.verificationOtpExpires = undefined;
    user.verificationOtpAttempts = 0;
    user.otpLastSentAt = undefined;
    user.lastActiveDate = new Date();
    await user.save();

    // Return JWT token for immediate authenticated session
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Resend OTP verification code
// @route   POST /api/v1/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    const cleanId = (identifier || '').trim().toLowerCase();

    if (!cleanId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email or mobile number.',
      });
    }

    const user = await User.findOne({
      $or: [{ email: cleanId }, { phone: cleanId }],
    }).select('+verificationOtpHash +verificationOtpExpires +verificationOtpAttempts +otpLastSentAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this identifier.',
      });
    }

    if (user.isVerified === true) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. You can log in directly.',
      });
    }

    // Rate limiting: 60s cooldown
    const now = new Date();
    if (user.otpLastSentAt && (now.getTime() - user.otpLastSentAt.getTime() < RESEND_INTERVAL_MS)) {
      const waitSec = Math.ceil((RESEND_INTERVAL_MS - (now.getTime() - user.otpLastSentAt.getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec} second(s) before requesting another code.`,
      });
    }

    // Generate new secure OTP
    const otp = generateOtp();
    user.verificationOtpHash = hashOtp(otp);
    user.verificationOtpExpires = new Date(now.getTime() + OTP_EXPIRY_MS);
    user.verificationOtpAttempts = 0;
    user.otpLastSentAt = now;
    await user.save();

    // Dispatch OTP
    const delivery = await dispatchOtp(cleanId, otp);

    res.status(200).json({
      success: true,
      message: 'A fresh verification code has been sent.',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, identifier, password } = req.body;
    const userEmail = (email || identifier || '').trim().toLowerCase();

    if (!userEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email/identifier and password',
      });
    }

    // Explicitly select password and verification fields
    const user = await User.findOne({
      $or: [{ email: userEmail }, { phone: userEmail }],
    }).select('+password +verificationOtpHash +verificationOtpExpires +verificationOtpAttempts +otpLastSentAt');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.',
      });
    }

    // Check verification status:
    // Only block if explicitly isVerified === false (legacy users where field is undefined remain verified)
    if (user.isVerified === false) {
      // Auto-dispatch fresh OTP if needed
      const otp = generateOtp();
      user.verificationOtpHash = hashOtp(otp);
      user.verificationOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
      user.verificationOtpAttempts = 0;
      user.otpLastSentAt = new Date();
      await user.save();

      const delivery = await dispatchOtp(user.email, otp);

      return res.status(403).json({
        success: false,
        requiresOtp: true,
        identifier: user.email,
        message: 'Account not verified. A new verification code has been sent to your registered email or phone.',
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      });
    }

    // Update lastActiveDate
    user.lastActiveDate = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
