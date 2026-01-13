import mongoose from 'mongoose';

// Achievement definitions
const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  xpReward: {
    type: Number,
    default: 50
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  category: {
    type: String,
    enum: ['workout', 'streak', 'nutrition', 'quiz', 'level', 'special'],
    default: 'special'
  },
  requirement: {
    type: {
      type: String,
      enum: ['streak', 'workout_count', 'quiz_score', 'level', 'calories_burned', 'meals_logged', 'water_goal', 'sleep_goal'],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  }
}, {
  timestamps: true
});

// User's unlocked achievements
const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number, // 0-100 percentage
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for unique user-achievement pairs
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

export const Achievement = mongoose.model('Achievement', achievementSchema);
export const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);




