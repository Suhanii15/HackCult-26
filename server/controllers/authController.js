const User = require('../models/User');

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

// @desc    Register a new user
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

    const existingUser = await User.findOne(duplicateQuery);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email or mobile number already exists. Please log in instead.',
      });
    }

    const user = await User.create({
      fullName: cleanName,
      email: userEmail,
      phone: normalizedPhone,
      password,
      district: district || 'Ahmedabad',
      city: city || 'Ahmedabad',
      totalPoints: 50, // Starting welcome bonus points
    });

    sendTokenResponse(user, 201, res);
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

    // Explicitly select password since it has select: false
    const user = await User.findOne({
      $or: [{ email: userEmail }, { phone: userEmail }],
    }).select('+password');

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
