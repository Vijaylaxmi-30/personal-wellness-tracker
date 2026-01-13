import express from 'express';
import BMIRecord from '../models/BMIRecord.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/bmi/calculate
// @desc    Calculate BMI and get recommendations
// @access  Private
router.post('/calculate', protect, async (req, res) => {
  try {
    const { weight, height, fitnessLevel = 'beginner' } = req.body;

    if (!weight || !height) {
      return res.status(400).json({
        success: false,
        message: 'Weight and height are required'
      });
    }

    // Calculate BMI
    const { bmi, category, recommendations } = BMIRecord.calculateBMI(weight, height);
    
    // Get workout plan
    const workoutPlan = BMIRecord.getWorkoutPlan(category, fitnessLevel);

    // Save record
    const record = await BMIRecord.create({
      user: req.user._id,
      weight,
      height,
      bmi,
      category,
      recommendations
    });

    // Update user's weight and height
    await User.findByIdAndUpdate(req.user._id, { weight, height });

    // Add XP for tracking BMI
    const user = await User.findById(req.user._id);
    await user.addXP(10);

    res.json({
      success: true,
      message: 'BMI calculated! +10 XP',
      data: {
        bmi,
        category,
        recommendations,
        workoutPlan,
        record
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate BMI',
      error: error.message
    });
  }
});

// @route   GET /api/bmi/history
// @desc    Get user's BMI history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;

    const history = await BMIRecord.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(limit);

    // Calculate trends
    const trend = history.length >= 2 ? {
      change: +(history[0].bmi - history[history.length - 1].bmi).toFixed(1),
      direction: history[0].bmi > history[history.length - 1].bmi ? 'up' : 'down',
      startBMI: history[history.length - 1].bmi,
      currentBMI: history[0].bmi
    } : null;

    res.json({
      success: true,
      data: {
        history,
        trend,
        latestRecord: history[0] || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get BMI history',
      error: error.message
    });
  }
});

// @route   GET /api/bmi/latest
// @desc    Get latest BMI record
// @access  Private
router.get('/latest', protect, async (req, res) => {
  try {
    const latest = await BMIRecord.findOne({ user: req.user._id })
      .sort({ date: -1 });

    if (!latest) {
      return res.json({
        success: true,
        data: { record: null, message: 'No BMI records found' }
      });
    }

    res.json({
      success: true,
      data: { record: latest }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get latest BMI',
      error: error.message
    });
  }
});

// @route   GET /api/bmi/recommendations
// @desc    Get workout recommendations based on current BMI
// @access  Private
router.get('/recommendations', protect, async (req, res) => {
  try {
    const fitnessLevel = req.query.fitnessLevel || 'beginner';

    const latest = await BMIRecord.findOne({ user: req.user._id })
      .sort({ date: -1 });

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: 'No BMI record found. Please calculate your BMI first.'
      });
    }

    const workoutPlan = BMIRecord.getWorkoutPlan(latest.category, fitnessLevel);

    // Additional nutrition tips based on BMI category
    const nutritionTips = {
      underweight: [
        'Eat calorie-dense, nutrient-rich foods',
        'Have protein with every meal',
        'Snack between meals',
        'Drink calories through smoothies',
        'Eat larger portions'
      ],
      normal: [
        'Maintain a balanced diet',
        'Eat plenty of fruits and vegetables',
        'Choose whole grains',
        'Limit processed foods',
        'Stay hydrated'
      ],
      overweight: [
        'Focus on portion control',
        'Increase vegetable intake',
        'Limit sugary drinks',
        'Choose lean proteins',
        'Prepare meals at home'
      ],
      obese: [
        'Start with small, sustainable changes',
        'Focus on whole foods',
        'Keep a food journal',
        'Eat slowly and mindfully',
        'Seek support from a nutritionist'
      ]
    };

    res.json({
      success: true,
      data: {
        bmi: latest.bmi,
        category: latest.category,
        workoutPlan,
        healthRecommendations: latest.recommendations,
        nutritionTips: nutritionTips[latest.category],
        fitnessLevel
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// @route   DELETE /api/bmi/:id
// @desc    Delete a BMI record
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const record = await BMIRecord.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'BMI record deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete record',
      error: error.message
    });
  }
});

export default router;




