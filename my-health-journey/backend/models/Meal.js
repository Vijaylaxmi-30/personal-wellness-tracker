import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number, // grams
    default: 0
  },
  carbs: {
    type: Number, // grams
    default: 0
  },
  fat: {
    type: Number, // grams
    default: 0
  },
  fiber: {
    type: Number, // grams
    default: 0
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: 'snack'
  },
  imageUrl: {
    type: String,
    default: null
  },
  isAIDetected: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number, // 0-100 percentage
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying meals by user and date
mealSchema.index({ user: 1, date: -1 });

// Virtual for meal time formatting
mealSchema.virtual('time').get(function() {
  return this.date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
});

// Ensure virtuals are included in JSON
mealSchema.set('toJSON', { virtuals: true });
mealSchema.set('toObject', { virtuals: true });

export default mongoose.model('Meal', mealSchema);




