import mongoose from 'mongoose';

const bmiRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number, // kg
    required: true
  },
  height: {
    type: Number, // cm
    required: true
  },
  bmi: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['underweight', 'normal', 'overweight', 'obese'],
    required: true
  },
  recommendations: [{
    type: String
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for user's BMI history
bmiRecordSchema.index({ user: 1, date: -1 });

// Static method to calculate BMI and category
bmiRecordSchema.statics.calculateBMI = function(weight, height) {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  let category;
  let recommendations;

  if (bmi < 18.5) {
    category = 'underweight';
    recommendations = [
      'Focus on strength training to build muscle mass',
      'Increase caloric intake with nutrient-dense foods',
      'Consider compound exercises like squats and deadlifts',
      'Add protein shakes post-workout',
      'Eat more frequently - aim for 5-6 smaller meals',
      'Include healthy fats like nuts, avocados, and olive oil'
    ];
  } else if (bmi < 25) {
    category = 'normal';
    recommendations = [
      'Maintain your current fitness routine',
      'Mix cardio with strength training for optimal health',
      'Try HIIT workouts for efficiency and variety',
      'Focus on flexibility and mobility exercises',
      'Continue balanced nutrition with all macronutrients',
      'Stay hydrated and prioritize quality sleep'
    ];
  } else if (bmi < 30) {
    category = 'overweight';
    recommendations = [
      'Start with low-impact cardio like swimming or cycling',
      'Aim for 150+ minutes of moderate exercise weekly',
      'Include resistance training 2-3 times per week',
      'Focus on creating a sustainable calorie deficit',
      'Reduce processed foods and increase vegetables',
      'Track your meals to understand eating patterns'
    ];
  } else {
    category = 'obese';
    recommendations = [
      'Consult a healthcare provider before starting',
      'Begin with walking and gradually increase intensity',
      'Focus on bodyweight exercises initially',
      'Consider working with a certified personal trainer',
      'Make gradual dietary changes for sustainability',
      'Set small, achievable goals to build momentum'
    ];
  }

  return { bmi: Math.round(bmi * 10) / 10, category, recommendations };
};

// Workout recommendations based on BMI and fitness level
bmiRecordSchema.statics.getWorkoutPlan = function(category, fitnessLevel = 'beginner') {
  const plans = {
    underweight: {
      beginner: [
        { name: 'Full Body Strength', frequency: '3x/week', duration: '30 min' },
        { name: 'Light Cardio', frequency: '2x/week', duration: '15 min' }
      ],
      intermediate: [
        { name: 'Push/Pull/Legs Split', frequency: '4x/week', duration: '45 min' },
        { name: 'Light Cardio', frequency: '2x/week', duration: '20 min' }
      ],
      advanced: [
        { name: 'Upper/Lower Split', frequency: '5x/week', duration: '60 min' },
        { name: 'Active Recovery', frequency: '2x/week', duration: '30 min' }
      ]
    },
    normal: {
      beginner: [
        { name: 'Full Body Workout', frequency: '3x/week', duration: '40 min' },
        { name: 'Cardio Mix', frequency: '2x/week', duration: '30 min' }
      ],
      intermediate: [
        { name: 'Push/Pull/Legs', frequency: '4x/week', duration: '50 min' },
        { name: 'HIIT Sessions', frequency: '2x/week', duration: '25 min' }
      ],
      advanced: [
        { name: 'Advanced Split', frequency: '5x/week', duration: '60 min' },
        { name: 'Mixed Cardio', frequency: '3x/week', duration: '30 min' }
      ]
    },
    overweight: {
      beginner: [
        { name: 'Walking Program', frequency: '5x/week', duration: '30 min' },
        { name: 'Light Resistance', frequency: '2x/week', duration: '20 min' }
      ],
      intermediate: [
        { name: 'Circuit Training', frequency: '3x/week', duration: '35 min' },
        { name: 'Moderate Cardio', frequency: '3x/week', duration: '30 min' }
      ],
      advanced: [
        { name: 'HIIT Training', frequency: '3x/week', duration: '30 min' },
        { name: 'Strength Training', frequency: '3x/week', duration: '45 min' }
      ]
    },
    obese: {
      beginner: [
        { name: 'Chair Exercises', frequency: '4x/week', duration: '15 min' },
        { name: 'Short Walks', frequency: 'Daily', duration: '10-15 min' }
      ],
      intermediate: [
        { name: 'Water Aerobics', frequency: '3x/week', duration: '30 min' },
        { name: 'Walking', frequency: '4x/week', duration: '25 min' }
      ],
      advanced: [
        { name: 'Low-Impact Cardio', frequency: '4x/week', duration: '35 min' },
        { name: 'Resistance Bands', frequency: '3x/week', duration: '25 min' }
      ]
    }
  };

  return plans[category]?.[fitnessLevel] || plans.normal.beginner;
};

export default mongoose.model('BMIRecord', bmiRecordSchema);




