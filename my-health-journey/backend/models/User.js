import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  avatar: {
    type: String,
    default: 'default-avatar'
  },
  // Gamification
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  // Profile data for BMI
  weight: {
    type: Number, // in kg
    default: null
  },
  height: {
    type: Number, // in cm
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  // Daily goals
  goals: {
    calories: { type: Number, default: 2000 },
    water: { type: Number, default: 8 }, // glasses
    workout: { type: Number, default: 60 }, // minutes
    steps: { type: Number, default: 10000 },
    sleep: { type: Number, default: 8 } // hours
  },
  // Settings
  preferences: {
    darkMode: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate XP needed for next level
userSchema.methods.xpForNextLevel = function() {
  return this.level * 100 + 400; // Level 1: 500, Level 2: 600, etc.
};

// Add XP and handle level up
userSchema.methods.addXP = async function(amount) {
  this.xp += amount;
  
  let leveledUp = false;
  while (this.xp >= this.xpForNextLevel()) {
    this.xp -= this.xpForNextLevel();
    this.level += 1;
    leveledUp = true;
  }
  
  await this.save();
  return { newXP: this.xp, newLevel: this.level, leveledUp };
};

// Update streak
userSchema.methods.updateStreak = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = new Date(this.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    this.streak += 1;
  } else if (diffDays > 1) {
    this.streak = 1;
  }
  // If diffDays === 0, streak stays the same
  
  this.lastActiveDate = new Date();
  await this.save();
  
  return this.streak;
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);




