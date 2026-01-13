import express from 'express';
import { Achievement, UserAchievement } from '../models/Achievement.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Default achievements to seed
const defaultAchievements = [
  {
    name: "Early Bird",
    description: "Complete 5 morning workouts",
    icon: "Star",
    xpReward: 50,
    rarity: "common",
    category: "workout",
    requirement: { type: "workout_count", value: 5 }
  },
  {
    name: "Fire Starter",
    description: "Achieve a 7 day streak",
    icon: "Flame",
    xpReward: 100,
    rarity: "rare",
    category: "streak",
    requirement: { type: "streak", value: 7 }
  },
  {
    name: "Goal Crusher",
    description: "Complete daily goals 10 times",
    icon: "Target",
    xpReward: 75,
    rarity: "common",
    category: "special",
    requirement: { type: "workout_count", value: 10 }
  },
  {
    name: "Iron Will",
    description: "Complete 20 strength workouts",
    icon: "Dumbbell",
    xpReward: 150,
    rarity: "epic",
    category: "workout",
    requirement: { type: "workout_count", value: 20 }
  },
  {
    name: "Hydration Hero",
    description: "Meet water goal for 14 days",
    icon: "Droplets",
    xpReward: 100,
    rarity: "rare",
    category: "nutrition",
    requirement: { type: "water_goal", value: 14 }
  },
  {
    name: "Sleep Master",
    description: "Get 8 hours sleep for a week",
    icon: "Moon",
    xpReward: 100,
    rarity: "rare",
    category: "special",
    requirement: { type: "sleep_goal", value: 7 }
  },
  {
    name: "Quiz Champion",
    description: "Score 100% on 10 quizzes",
    icon: "Brain",
    xpReward: 200,
    rarity: "epic",
    category: "quiz",
    requirement: { type: "quiz_score", value: 10 }
  },
  {
    name: "Legendary Warrior",
    description: "Reach level 50",
    icon: "Trophy",
    xpReward: 500,
    rarity: "legendary",
    category: "level",
    requirement: { type: "level", value: 50 }
  },
  {
    name: "First Steps",
    description: "Complete your first workout",
    icon: "Footprints",
    xpReward: 25,
    rarity: "common",
    category: "workout",
    requirement: { type: "workout_count", value: 1 }
  },
  {
    name: "Calorie Counter",
    description: "Log 50 meals",
    icon: "Apple",
    xpReward: 100,
    rarity: "rare",
    category: "nutrition",
    requirement: { type: "meals_logged", value: 50 }
  },
  {
    name: "Burn Baby Burn",
    description: "Burn 5000 calories total",
    icon: "Flame",
    xpReward: 150,
    rarity: "epic",
    category: "workout",
    requirement: { type: "calories_burned", value: 5000 }
  },
  {
    name: "Level 10",
    description: "Reach level 10",
    icon: "Medal",
    xpReward: 100,
    rarity: "rare",
    category: "level",
    requirement: { type: "level", value: 10 }
  },
  {
    name: "Two Week Warrior",
    description: "Maintain a 14 day streak",
    icon: "Flame",
    xpReward: 200,
    rarity: "epic",
    category: "streak",
    requirement: { type: "streak", value: 14 }
  },
  {
    name: "Month Master",
    description: "Maintain a 30 day streak",
    icon: "Crown",
    xpReward: 500,
    rarity: "legendary",
    category: "streak",
    requirement: { type: "streak", value: 30 }
  }
];

// @route   GET /api/achievements
// @desc    Get all achievements with user's progress
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Seed achievements if none exist
    const count = await Achievement.countDocuments();
    if (count === 0) {
      await Achievement.insertMany(defaultAchievements);
    }

    // Get all achievements
    const achievements = await Achievement.find().sort({ rarity: 1 });

    // Get user's unlocked achievements
    const userAchievements = await UserAchievement.find({ user: req.user._id })
      .populate('achievement');

    // Merge data
    const achievementsWithProgress = achievements.map(achievement => {
      const userAchievement = userAchievements.find(
        ua => ua.achievement._id.toString() === achievement._id.toString()
      );

      return {
        ...achievement.toObject(),
        unlocked: userAchievement?.progress >= 100,
        progress: userAchievement?.progress || 0,
        unlockedAt: userAchievement?.unlockedAt
      };
    });

    // Calculate total XP from achievements
    const totalXPFromAchievements = userAchievements
      .filter(ua => ua.progress >= 100)
      .reduce((sum, ua) => sum + ua.achievement.xpReward, 0);

    res.json({
      success: true,
      data: {
        achievements: achievementsWithProgress,
        stats: {
          total: achievements.length,
          unlocked: userAchievements.filter(ua => ua.progress >= 100).length,
          totalXPFromAchievements
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements',
      error: error.message
    });
  }
});

// @route   POST /api/achievements/check
// @desc    Check and update achievement progress
// @access  Private
router.post('/check', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const achievements = await Achievement.find();
    const newlyUnlocked = [];

    for (const achievement of achievements) {
      let progress = 0;
      let currentValue = 0;

      // Calculate progress based on requirement type
      switch (achievement.requirement.type) {
        case 'streak':
          currentValue = user.streak;
          progress = Math.min(100, (currentValue / achievement.requirement.value) * 100);
          break;
        case 'level':
          currentValue = user.level;
          progress = Math.min(100, (currentValue / achievement.requirement.value) * 100);
          break;
        // Other types would need their own calculations from respective models
      }

      // Update or create user achievement
      const existing = await UserAchievement.findOne({
        user: req.user._id,
        achievement: achievement._id
      });

      const wasUnlocked = existing?.progress >= 100;
      const isNowUnlocked = progress >= 100;

      if (existing) {
        existing.progress = Math.max(existing.progress, progress);
        if (!wasUnlocked && isNowUnlocked) {
          existing.unlockedAt = new Date();
          newlyUnlocked.push(achievement);
        }
        await existing.save();
      } else {
        await UserAchievement.create({
          user: req.user._id,
          achievement: achievement._id,
          progress,
          unlockedAt: isNowUnlocked ? new Date() : null
        });
        if (isNowUnlocked) {
          newlyUnlocked.push(achievement);
        }
      }
    }

    // Award XP for newly unlocked achievements
    let totalXPEarned = 0;
    for (const achievement of newlyUnlocked) {
      await user.addXP(achievement.xpReward);
      totalXPEarned += achievement.xpReward;
    }

    res.json({
      success: true,
      data: {
        newlyUnlocked: newlyUnlocked.map(a => ({
          name: a.name,
          description: a.description,
          xpReward: a.xpReward,
          rarity: a.rarity
        })),
        totalXPEarned
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check achievements',
      error: error.message
    });
  }
});

// @route   GET /api/achievements/recent
// @desc    Get recently unlocked achievements
// @access  Private
router.get('/recent', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const recentAchievements = await UserAchievement.find({
      user: req.user._id,
      progress: 100
    })
      .populate('achievement')
      .sort({ unlockedAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: { achievements: recentAchievements }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get recent achievements',
      error: error.message
    });
  }
});

export default router;




