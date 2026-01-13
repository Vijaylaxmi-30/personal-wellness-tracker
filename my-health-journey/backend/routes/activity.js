import express from 'express';
import Activity from '../models/Activity.js';
import DailyStats from '../models/DailyStats.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/activity
// @desc    Get user's activities
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { date, startDate, endDate, limit = 20, type } = req.query;
    
    let query = { user: req.user._id };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (type) {
      query.type = type;
    }

    const activities = await Activity.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Calculate totals
    const totals = activities.reduce((acc, activity) => ({
      duration: acc.duration + activity.duration,
      caloriesBurned: acc.caloriesBurned + activity.caloriesBurned
    }), { duration: 0, caloriesBurned: 0 });

    res.json({
      success: true,
      data: {
        activities,
        totals,
        count: activities.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get activities',
      error: error.message
    });
  }
});

// @route   POST /api/activity
// @desc    Log a new activity
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { type, duration, caloriesBurned, distance, avgHeartRate, notes, intensity, date } = req.body;

    // Calculate calories if not provided
    const user = await User.findById(req.user._id);
    const calculatedCalories = caloriesBurned || Activity.calculateCalories(type, duration, user.weight || 70);

    const activity = await Activity.create({
      user: req.user._id,
      type,
      duration,
      caloriesBurned: calculatedCalories,
      distance,
      avgHeartRate,
      notes,
      intensity: intensity || 'moderate',
      date: date ? new Date(date) : new Date()
    });

    // Update daily stats
    const stats = await DailyStats.getOrCreateToday(req.user._id);
    stats.caloriesBurned += calculatedCalories;
    stats.workoutMinutes += duration;
    stats.workoutCount += 1;
    await stats.save();

    // Add XP based on activity intensity
    const xpMultiplier = { low: 1, moderate: 1.5, high: 2, extreme: 2.5 };
    const baseXP = Math.floor(duration / 10) * 5; // 5 XP per 10 minutes
    const xpToAdd = Math.floor(baseXP * (xpMultiplier[intensity] || 1.5));
    await user.addXP(xpToAdd);

    res.status(201).json({
      success: true,
      message: `Activity logged! +${xpToAdd} XP`,
      data: { activity, xpEarned: xpToAdd }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to log activity',
      error: error.message
    });
  }
});

// @route   PUT /api/activity/:id
// @desc    Update an activity
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const allowedUpdates = ['type', 'duration', 'caloriesBurned', 'distance', 'avgHeartRate', 'notes', 'intensity'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        activity[field] = req.body[field];
      }
    });

    await activity.save();

    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: { activity }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update activity',
      error: error.message
    });
  }
});

// @route   DELETE /api/activity/:id
// @desc    Delete an activity
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await activity.deleteOne();

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity',
      error: error.message
    });
  }
});

// @route   GET /api/activity/types
// @desc    Get available activity types
// @access  Private
router.get('/types', protect, (req, res) => {
  const activityTypes = [
    { value: 'running', label: 'Running', icon: 'Footprints', met: 9.8 },
    { value: 'walking', label: 'Walking', icon: 'Footprints', met: 3.5 },
    { value: 'cycling', label: 'Cycling', icon: 'Bike', met: 7.5 },
    { value: 'swimming', label: 'Swimming', icon: 'Waves', met: 8.0 },
    { value: 'strength-training', label: 'Strength Training', icon: 'Dumbbell', met: 6.0 },
    { value: 'yoga', label: 'Yoga', icon: 'Heart', met: 3.0 },
    { value: 'hiit', label: 'HIIT', icon: 'Zap', met: 12.0 },
    { value: 'cardio', label: 'Cardio', icon: 'Activity', met: 7.0 },
    { value: 'stretching', label: 'Stretching', icon: 'Move', met: 2.5 },
    { value: 'sports', label: 'Sports', icon: 'Trophy', met: 7.0 },
    { value: 'dancing', label: 'Dancing', icon: 'Music', met: 6.0 },
    { value: 'other', label: 'Other', icon: 'MoreHorizontal', met: 5.0 }
  ];

  res.json({
    success: true,
    data: { activityTypes }
  });
});

// @route   GET /api/activity/weekly
// @desc    Get weekly activity summary
// @access  Private
router.get('/weekly', protect, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const activities = await Activity.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$caloriesBurned' },
          workoutCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get user's weekly goal
    const user = await User.findById(req.user._id);
    const weeklyGoal = user.goals.workout * 7; // Daily goal * 7 days

    const totalMinutes = activities.reduce((sum, day) => sum + day.totalDuration, 0);
    const totalCalories = activities.reduce((sum, day) => sum + day.totalCalories, 0);

    res.json({
      success: true,
      data: {
        dailyBreakdown: activities,
        totals: {
          minutes: totalMinutes,
          calories: totalCalories,
          workouts: activities.reduce((sum, day) => sum + day.workoutCount, 0)
        },
        goal: {
          target: weeklyGoal,
          current: totalMinutes,
          progress: Math.min(100, Math.round((totalMinutes / weeklyGoal) * 100))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly summary',
      error: error.message
    });
  }
});

// @route   POST /api/activity/calculate-calories
// @desc    Calculate calories for an activity
// @access  Private
router.post('/calculate-calories', protect, async (req, res) => {
  try {
    const { type, duration } = req.body;
    const user = await User.findById(req.user._id);
    
    const calories = Activity.calculateCalories(type, duration, user.weight || 70);

    res.json({
      success: true,
      data: { 
        type,
        duration,
        estimatedCalories: calories,
        weight: user.weight || 70
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate calories',
      error: error.message
    });
  }
});

export default router;




