const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/v1/users/me
// @access  Private
exports.getProfile = async (req, res, next) => {
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

// @desc    Update user profile & household configuration
// @route   PATCH /api/v1/users/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'fullName',
      'state',
      'district',
      'city',
      'onboardingCompleted',
      'onboardingMode',
      'household',
      'baselineAnnualCO2Kg',
      'baselineMonthlyCO2Kg',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};
