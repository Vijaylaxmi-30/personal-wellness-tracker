import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Meal from '../models/Meal.js';
import DailyStats from '../models/DailyStats.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { uploadMemory } from '../middleware/upload.js';

const router = express.Router();

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// @route   GET /api/meals
// @desc    Get user's meals
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { date, limit = 20 } = req.query;
    
    let query = { user: req.user._id };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const meals = await Meal.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Calculate totals
    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    res.json({
      success: true,
      data: {
        meals,
        totals,
        count: meals.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get meals',
      error: error.message
    });
  }
});

// @route   POST /api/meals
// @desc    Add a new meal
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, mealType, date } = req.body;

    if (!name || !calories) {
      return res.status(400).json({
        success: false,
        message: 'Name and calories are required'
      });
    }

    const meal = await Meal.create({
      user: req.user._id,
      name,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      mealType: mealType || 'snack',
      date: date ? new Date(date) : new Date()
    });

    // Update daily stats
    const stats = await DailyStats.getOrCreateToday(req.user._id);
    stats.caloriesConsumed += calories;
    await stats.save();

    // Add XP for logging meal
    const user = await User.findById(req.user._id);
    await user.addXP(5);

    res.status(201).json({
      success: true,
      message: 'Meal logged! +5 XP',
      data: { meal }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add meal',
      error: error.message
    });
  }
});

// @route   POST /api/meals/analyze
// @desc    Analyze meal image with AI
// @access  Private
router.post('/analyze', protect, uploadMemory.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    if (!genAI) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please add GEMINI_API_KEY to environment variables.'
      });
    }

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Use Gemini to analyze the image
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this food image and provide nutritional information in JSON format only (no markdown, no code blocks).
Return ONLY a valid JSON object with these exact fields:
{
  "name": "name of the food/meal",
  "calories": estimated calories (number),
  "protein": estimated protein in grams (number),
  "carbs": estimated carbohydrates in grams (number),
  "fat": estimated fat in grams (number),
  "confidence": your confidence level 0-100 (number),
  "mealType": one of "breakfast", "lunch", "dinner", or "snack"
}

If you cannot identify the food, return:
{"error": "Could not identify food in image", "confidence": 0}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      }
    ]);

    const responseText = result.response.text();
    
    // Parse JSON response
    let nutritionData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response',
        error: parseError.message
      });
    }

    if (nutritionData.error) {
      return res.status(400).json({
        success: false,
        message: nutritionData.error,
        data: { confidence: nutritionData.confidence }
      });
    }

    res.json({
      success: true,
      message: 'Meal analyzed successfully',
      data: {
        name: nutritionData.name,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        confidence: nutritionData.confidence,
        mealType: nutritionData.mealType || 'snack',
        isAIDetected: true
      }
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze meal',
      error: error.message
    });
  }
});

// @route   POST /api/meals/save-analyzed
// @desc    Save an AI-analyzed meal
// @access  Private
router.post('/save-analyzed', protect, async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, mealType, imageUrl, aiConfidence } = req.body;

    const meal = await Meal.create({
      user: req.user._id,
      name,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      mealType: mealType || 'snack',
      imageUrl,
      isAIDetected: true,
      aiConfidence
    });

    // Update daily stats
    const stats = await DailyStats.getOrCreateToday(req.user._id);
    stats.caloriesConsumed += calories;
    await stats.save();

    // Add XP for using AI feature
    const user = await User.findById(req.user._id);
    await user.addXP(10);

    res.status(201).json({
      success: true,
      message: 'AI meal saved! +10 XP',
      data: { meal }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save analyzed meal',
      error: error.message
    });
  }
});

// @route   PUT /api/meals/:id
// @desc    Update a meal
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    const allowedUpdates = ['name', 'calories', 'protein', 'carbs', 'fat', 'mealType'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        meal[field] = req.body[field];
      }
    });

    await meal.save();

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: { meal }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update meal',
      error: error.message
    });
  }
});

// @route   DELETE /api/meals/:id
// @desc    Delete a meal
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    await meal.deleteOne();

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete meal',
      error: error.message
    });
  }
});

// @route   GET /api/meals/summary
// @desc    Get meal summary for past days
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const meals = await Meal.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFat: { $sum: '$fat' },
          mealCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: meals,
        days
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get meal summary',
      error: error.message
    });
  }
});

export default router;
