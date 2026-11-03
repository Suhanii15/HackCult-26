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
      onboardingMode: user.onboardingMode,
      totalPoints: user.totalPoints,
      currentStreakDays: user.currentStreakDays,
      baselineAnnualCO2Kg: user.baselineAnnualCO2Kg,
      household: user.household,
      ecoScore: user.ecoScore,
    },
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, identifier, password, phone, district, city } = req.body;

    const userEmail = (email || identifier || '').trim().toLowerCase();

    if (!userEmail || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email/identifier, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email/identifier already exists. Please log in.',
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: userEmail,
      phone: phone || (userEmail.match(/^[0-9+]+$/) ? userEmail : undefined),
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
