import mongoose from 'mongoose';

const dailyStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // Health metrics
  caloriesBurned: {
    type: Number,
    default: 0
  },
  caloriesConsumed: {
    type: Number,
    default: 0
  },
  steps: {
    type: Number,
    default: 0
  },
  waterIntake: {
    type: Number, // glasses
    default: 0
  },
  sleepHours: {
    type: Number,
    default: 0
  },
  sleepQuality: {
    type: String,
    enum: ['poor', 'fair', 'good', 'excellent'],
    default: 'good'
  },
  // Workout summary
  workoutMinutes: {
    type: Number,
    default: 0
  },
  workoutCount: {
    type: Number,
    default: 0
  },
  // Mood tracking
  mood: {
    type: String,
    enum: ['terrible', 'bad', 'neutral', 'good', 'great'],
    default: 'neutral'
  },
  // Goal completion percentages
  goalCompletion: {
    calories: { type: Number, default: 0 },
    water: { type: Number, default: 0 },
    workout: { type: Number, default: 0 },
    steps: { type: Number, default: 0 },
    sleep: { type: Number, default: 0 }
  },
  // Notes
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for user and date (unique per day)
dailyStatsSchema.index({ user: 1, date: 1 }, { unique: true });

// Static method to get or create today's stats
dailyStatsSchema.statics.getOrCreateToday = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let stats = await this.findOne({ user: userId, date: today });
  
  if (!stats) {
    stats = await this.create({ user: userId, date: today });
  }
  
  return stats;
};

// Calculate overall goal completion
dailyStatsSchema.methods.calculateOverallProgress = function(userGoals) {
  const completions = [];
  
  if (userGoals.calories > 0) {
    this.goalCompletion.calories = Math.min(100, (this.caloriesBurned / userGoals.calories) * 100);
    completions.push(this.goalCompletion.calories);
  }
  
  if (userGoals.water > 0) {
    this.goalCompletion.water = Math.min(100, (this.waterIntake / userGoals.water) * 100);
    completions.push(this.goalCompletion.water);
  }
  
  if (userGoals.workout > 0) {
    this.goalCompletion.workout = Math.min(100, (this.workoutMinutes / userGoals.workout) * 100);
    completions.push(this.goalCompletion.workout);
  }
  
  if (userGoals.steps > 0) {
    this.goalCompletion.steps = Math.min(100, (this.steps / userGoals.steps) * 100);
    completions.push(this.goalCompletion.steps);
  }
  
  if (userGoals.sleep > 0) {
    this.goalCompletion.sleep = Math.min(100, (this.sleepHours / userGoals.sleep) * 100);
    completions.push(this.goalCompletion.sleep);
  }
  
  return completions.length > 0 
    ? Math.round(completions.reduce((a, b) => a + b, 0) / completions.length) 
    : 0;
};

export default mongoose.model('DailyStats', dailyStatsSchema);




