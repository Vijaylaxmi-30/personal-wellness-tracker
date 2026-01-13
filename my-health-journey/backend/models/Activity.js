import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'running', 'walking', 'cycling', 'swimming', 
      'strength-training', 'yoga', 'hiit', 'cardio',
      'stretching', 'sports', 'dancing', 'other'
    ]
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  caloriesBurned: {
    type: Number,
    required: true
  },
  distance: {
    type: Number, // in km, optional
    default: null
  },
  avgHeartRate: {
    type: Number, // bpm, optional
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high', 'extreme'],
    default: 'moderate'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying activities by user and date
activitySchema.index({ user: 1, date: -1 });

// Static method to calculate calories burned based on activity type
activitySchema.statics.calculateCalories = function(type, duration, weight = 70) {
  // MET values for different activities (Metabolic Equivalent of Task)
  const metValues = {
    'running': 9.8,
    'walking': 3.5,
    'cycling': 7.5,
    'swimming': 8.0,
    'strength-training': 6.0,
    'yoga': 3.0,
    'hiit': 12.0,
    'cardio': 7.0,
    'stretching': 2.5,
    'sports': 7.0,
    'dancing': 6.0,
    'other': 5.0
  };

  const met = metValues[type] || 5.0;
  // Calories = MET * weight(kg) * duration(hours)
  return Math.round(met * weight * (duration / 60));
};

export default mongoose.model('Activity', activitySchema);




