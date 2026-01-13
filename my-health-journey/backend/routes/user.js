import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        user,
        xpToNextLevel: user.xpForNextLevel()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty(),
  body('weight').optional().isNumeric(),
  body('height').optional().isNumeric(),
  body('gender').optional().isIn(['male', 'female', 'other']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const allowedUpdates = ['name', 'weight', 'height', 'gender', 'dateOfBirth', 'avatar'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// @route   PUT /api/user/goals
// @desc    Update user goals
// @access  Private
router.put('/goals', protect, async (req, res) => {
  try {
    const { calories, water, workout, steps, sleep } = req.body;

    const user = await User.findById(req.user._id);
    
    if (calories !== undefined) user.goals.calories = calories;
    if (water !== undefined) user.goals.water = water;
    if (workout !== undefined) user.goals.workout = workout;
    if (steps !== undefined) user.goals.steps = steps;
    if (sleep !== undefined) user.goals.sleep = sleep;

    await user.save();

    res.json({
      success: true,
      message: 'Goals updated successfully',
      data: { goals: user.goals }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update goals',
      error: error.message
    });
  }
});

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { darkMode, notifications } = req.body;

    const user = await User.findById(req.user._id);
    
    if (darkMode !== undefined) user.preferences.darkMode = darkMode;
    if (notifications !== undefined) user.preferences.notifications = notifications;

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
});

// @route   POST /api/user/xp
// @desc    Add XP to user (for completing actions)
// @access  Private
router.post('/xp', protect, async (req, res) => {
  try {
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid XP amount required'
      });
    }

    const user = await User.findById(req.user._id);
    const result = await user.addXP(amount);

    res.json({
      success: true,
      message: result.leveledUp ? `Level up! You're now level ${result.newLevel}!` : `+${amount} XP earned!`,
      data: {
        xp: result.newXP,
        level: result.newLevel,
        leveledUp: result.leveledUp,
        xpToNextLevel: user.xpForNextLevel(),
        reason
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add XP',
      error: error.message
    });
  }
});

// @route   GET /api/user/gamification
// @desc    Get user's gamification stats
// @access  Private
router.get('/gamification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        level: user.level,
        xp: user.xp,
        xpToNextLevel: user.xpForNextLevel(),
        xpProgress: Math.round((user.xp / user.xpForNextLevel()) * 100),
        streak: user.streak,
        totalXPEarned: (user.level - 1) * 500 + user.xp // Approximate total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get gamification stats',
      error: error.message
    });
  }
});

// @route   PUT /api/user/avatar
// @desc    Update user avatar
// @access  Private
router.put('/avatar', protect, async (req, res) => {
  try {
    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update avatar',
      error: error.message
    });
  }
});

export default router;




