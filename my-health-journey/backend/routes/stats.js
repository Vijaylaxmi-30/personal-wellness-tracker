import express from 'express';
import DailyStats from '../models/DailyStats.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/stats/today
// @desc    Get today's stats
// @access  Private
router.get('/today', protect, async (req, res) => {
  try {
    const stats = await DailyStats.getOrCreateToday(req.user._id);
    const user = await User.findById(req.user._id);

    // Calculate goal completions
    const overallProgress = stats.calculateOverallProgress(user.goals);
    await stats.save();

    res.json({
      success: true,
      data: {
        stats,
        goals: user.goals,
        overallProgress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get stats',
      error: error.message
    });
  }
});

// @route   PUT /api/stats/today
// @desc    Update today's stats
// @access  Private
router.put('/today', protect, async (req, res) => {
  try {
    const stats = await DailyStats.getOrCreateToday(req.user._id);
    const user = await User.findById(req.user._id);

    const updatableFields = [
      'caloriesBurned', 'caloriesConsumed', 'steps', 
      'waterIntake', 'sleepHours', 'sleepQuality',
      'workoutMinutes', 'mood', 'notes'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        stats[field] = req.body[field];
      }
    });

    // Recalculate goal completion
    const overallProgress = stats.calculateOverallProgress(user.goals);
    await stats.save();

    res.json({
      success: true,
      message: 'Stats updated successfully',
      data: {
        stats,
        overallProgress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update stats',
      error: error.message
    });
  }
});

// @route   POST /api/stats/water
// @desc    Add water intake
// @access  Private
router.post('/water', protect, async (req, res) => {
  try {
    const { glasses = 1 } = req.body;
    const stats = await DailyStats.getOrCreateToday(req.user._id);
    const user = await User.findById(req.user._id);

    stats.waterIntake += glasses;
    stats.calculateOverallProgress(user.goals);
    await stats.save();

    // Add XP for logging water
    await user.addXP(2);

    res.json({
      success: true,
      message: `Water logged! ${stats.waterIntake}/${user.goals.water} glasses`,
      data: {
        waterIntake: stats.waterIntake,
        goal: user.goals.water,
        progress: stats.goalCompletion.water
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to log water',
      error: error.message
    });
  }
});

// @route   POST /api/stats/steps
// @desc    Update steps count
// @access  Private
router.post('/steps', protect, async (req, res) => {
  try {
    const { steps } = req.body;
    const stats = await DailyStats.getOrCreateToday(req.user._id);
    const user = await User.findById(req.user._id);

    stats.steps = steps;
    stats.calculateOverallProgress(user.goals);
    await stats.save();

    res.json({
      success: true,
      message: 'Steps updated!',
      data: {
        steps: stats.steps,
        goal: user.goals.steps,
        progress: stats.goalCompletion.steps
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update steps',
      error: error.message
    });
  }
});

// @route   POST /api/stats/sleep
// @desc    Log sleep data
// @access  Private
router.post('/sleep', protect, async (req, res) => {
  try {
    const { hours, quality } = req.body;
    const stats = await DailyStats.getOrCreateToday(req.user._id);
    const user = await User.findById(req.user._id);

    stats.sleepHours = hours;
    if (quality) stats.sleepQuality = quality;
    stats.calculateOverallProgress(user.goals);
    await stats.save();

    // Add XP for logging sleep
    await user.addXP(5);

    res.json({
      success: true,
      message: 'Sleep logged! +5 XP',
      data: {
        sleepHours: stats.sleepHours,
        sleepQuality: stats.sleepQuality,
        goal: user.goals.sleep,
        progress: stats.goalCompletion.sleep
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to log sleep',
      error: error.message
    });
  }
});

// @route   GET /api/stats/weekly
// @desc    Get weekly stats summary
// @access  Private
router.get('/weekly', protect, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const weeklyStats = await DailyStats.find({
      user: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Calculate averages and totals
    const summary = {
      avgCaloriesBurned: 0,
      avgCaloriesConsumed: 0,
      avgSteps: 0,
      avgWater: 0,
      avgSleep: 0,
      totalWorkoutMinutes: 0,
      totalWorkouts: 0,
      daysTracked: weeklyStats.length
    };

    if (weeklyStats.length > 0) {
      const totals = weeklyStats.reduce((acc, day) => ({
        caloriesBurned: acc.caloriesBurned + day.caloriesBurned,
        caloriesConsumed: acc.caloriesConsumed + day.caloriesConsumed,
        steps: acc.steps + day.steps,
        water: acc.water + day.waterIntake,
        sleep: acc.sleep + day.sleepHours,
        workoutMinutes: acc.workoutMinutes + day.workoutMinutes,
        workouts: acc.workouts + day.workoutCount
      }), { caloriesBurned: 0, caloriesConsumed: 0, steps: 0, water: 0, sleep: 0, workoutMinutes: 0, workouts: 0 });

      summary.avgCaloriesBurned = Math.round(totals.caloriesBurned / weeklyStats.length);
      summary.avgCaloriesConsumed = Math.round(totals.caloriesConsumed / weeklyStats.length);
      summary.avgSteps = Math.round(totals.steps / weeklyStats.length);
      summary.avgWater = Math.round(totals.water / weeklyStats.length * 10) / 10;
      summary.avgSleep = Math.round(totals.sleep / weeklyStats.length * 10) / 10;
      summary.totalWorkoutMinutes = totals.workoutMinutes;
      summary.totalWorkouts = totals.workouts;
    }

    res.json({
      success: true,
      data: {
        dailyStats: weeklyStats,
        summary
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly stats',
      error: error.message
    });
  }
});

// @route   GET /api/stats/monthly
// @desc    Get monthly stats for reports
// @access  Private
router.get('/monthly', protect, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    const monthlyStats = await DailyStats.find({
      user: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Group by week
    const weeklyData = [];
    let currentWeek = [];
    let weekStart = new Date(startDate);

    monthlyStats.forEach(day => {
      const dayDate = new Date(day.date);
      const diffDays = Math.floor((dayDate - weekStart) / (1000 * 60 * 60 * 24));

      if (diffDays >= 7) {
        if (currentWeek.length > 0) {
          weeklyData.push(summarizeWeek(currentWeek, weekStart));
        }
        weekStart = new Date(dayDate);
        currentWeek = [day];
      } else {
        currentWeek.push(day);
      }
    });

    if (currentWeek.length > 0) {
      weeklyData.push(summarizeWeek(currentWeek, weekStart));
    }

    res.json({
      success: true,
      data: {
        weeklyData,
        totalDays: monthlyStats.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get monthly stats',
      error: error.message
    });
  }
});

// Helper function to summarize a week
function summarizeWeek(days, weekStart) {
  const totals = days.reduce((acc, day) => ({
    caloriesBurned: acc.caloriesBurned + day.caloriesBurned,
    steps: acc.steps + day.steps,
    workoutMinutes: acc.workoutMinutes + day.workoutMinutes
  }), { caloriesBurned: 0, steps: 0, workoutMinutes: 0 });

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    caloriesBurned: totals.caloriesBurned,
    avgSteps: Math.round(totals.steps / days.length),
    workoutMinutes: totals.workoutMinutes,
    daysTracked: days.length
  };
}

// @route   GET /api/stats/quotes
// @desc    Get motivational quotes
// @access  Private
router.get('/quotes', protect, (req, res) => {
  const quotes = [
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
    { text: "The groundwork for all happiness is good health.", author: "Leigh Hunt" },
    { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Unknown" },
    { text: "The only way to keep your health is to eat what you don't want, drink what you don't like, and do what you'd rather not.", author: "Mark Twain" },
    { text: "Health is not about the weight you lose, but about the life you gain.", author: "Unknown" },
    { text: "The greatest wealth is health.", author: "Virgil" },
    { text: "Your health is an investment, not an expense.", author: "Unknown" },
    { text: "Strive for progress, not perfection.", author: "Unknown" }
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  res.json({
    success: true,
    data: { quote: randomQuote }
  });
});

export default router;




