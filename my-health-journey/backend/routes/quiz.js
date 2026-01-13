import express from 'express';
import { QuizQuestion, QuizResult } from '../models/Quiz.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Default quiz questions to seed
const defaultQuestions = [
  {
    question: "How many glasses of water should you drink daily?",
    options: ["4 glasses", "6 glasses", "8 glasses", "10 glasses"],
    correctAnswer: 2,
    explanation: "8 glasses (about 2 liters) is the recommended daily water intake for adults.",
    category: "hydration",
    difficulty: "easy",
    xpReward: 10
  },
  {
    question: "Which macronutrient helps build and repair muscles?",
    options: ["Carbohydrates", "Protein", "Fat", "Fiber"],
    correctAnswer: 1,
    explanation: "Protein is essential for muscle building, repair, and recovery after exercise.",
    category: "nutrition",
    difficulty: "easy",
    xpReward: 10
  },
  {
    question: "How many hours of sleep are recommended for adults?",
    options: ["4-5 hours", "5-6 hours", "7-9 hours", "10-12 hours"],
    correctAnswer: 2,
    explanation: "Adults should aim for 7-9 hours of quality sleep per night for optimal health.",
    category: "sleep",
    difficulty: "easy",
    xpReward: 10
  },
  {
    question: "What's the best time to exercise for weight loss?",
    options: ["Morning only", "Evening only", "Anytime consistently", "Only on weekends"],
    correctAnswer: 2,
    explanation: "Consistency is key! The best time to exercise is whenever you can do it regularly.",
    category: "exercise",
    difficulty: "medium",
    xpReward: 15
  },
  {
    question: "Which activity burns the most calories per hour?",
    options: ["Walking", "Swimming", "Running", "Yoga"],
    correctAnswer: 2,
    explanation: "Running burns approximately 600-800 calories per hour, making it highly effective for weight management.",
    category: "exercise",
    difficulty: "medium",
    xpReward: 15
  },
  {
    question: "What percentage of your plate should be vegetables?",
    options: ["10%", "25%", "50%", "75%"],
    correctAnswer: 2,
    explanation: "According to the healthy plate model, vegetables should make up about 50% of your plate.",
    category: "nutrition",
    difficulty: "medium",
    xpReward: 15
  },
  {
    question: "How long before bed should you stop using screens?",
    options: ["15 minutes", "30 minutes", "1 hour", "2 hours"],
    correctAnswer: 2,
    explanation: "Experts recommend avoiding screens at least 1 hour before bed to improve sleep quality.",
    category: "sleep",
    difficulty: "medium",
    xpReward: 15
  },
  {
    question: "What is the recommended daily step count for health benefits?",
    options: ["3,000 steps", "5,000 steps", "10,000 steps", "15,000 steps"],
    correctAnswer: 2,
    explanation: "10,000 steps per day is the commonly recommended goal for maintaining good health.",
    category: "exercise",
    difficulty: "easy",
    xpReward: 10
  },
  {
    question: "Which vitamin is produced when you get sunlight exposure?",
    options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E"],
    correctAnswer: 2,
    explanation: "Vitamin D is synthesized in your skin when exposed to sunlight.",
    category: "general",
    difficulty: "medium",
    xpReward: 15
  },
  {
    question: "What is a healthy resting heart rate for adults?",
    options: ["40-50 bpm", "60-100 bpm", "100-120 bpm", "120-140 bpm"],
    correctAnswer: 1,
    explanation: "A normal resting heart rate for adults ranges from 60 to 100 beats per minute.",
    category: "general",
    difficulty: "hard",
    xpReward: 20
  }
];

// @route   GET /api/quiz/questions
// @desc    Get random quiz questions for daily quiz
// @access  Private
router.get('/questions', protect, async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5;
    const category = req.query.category;
    const difficulty = req.query.difficulty;

    let query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    // Get random questions
    let questions = await QuizQuestion.aggregate([
      { $match: query },
      { $sample: { size: count } }
    ]);

    // If no questions exist, seed the database
    if (questions.length === 0) {
      await QuizQuestion.insertMany(defaultQuestions);
      questions = await QuizQuestion.aggregate([
        { $match: query },
        { $sample: { size: count } }
      ]);
    }

    res.json({
      success: true,
      data: {
        questions: questions.map(q => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          category: q.category,
          difficulty: q.difficulty
        })),
        totalQuestions: questions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get questions',
      error: error.message
    });
  }
});

// @route   POST /api/quiz/submit
// @desc    Submit quiz answers and get results
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionId, selectedAnswer }]

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    // Get questions and calculate score
    const questionIds = answers.map(a => a.questionId);
    const questions = await QuizQuestion.find({ _id: { $in: questionIds } });

    let score = 0;
    let totalXP = 0;
    const results = [];

    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (question) {
        const isCorrect = question.correctAnswer === answer.selectedAnswer;
        if (isCorrect) {
          score++;
          totalXP += question.xpReward;
        }
        results.push({
          questionId: question._id,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: question.explanation,
          xpEarned: isCorrect ? question.xpReward : 0
        });
      }
    }

    // Save quiz result
    const quizResult = await QuizResult.create({
      user: req.user._id,
      score,
      totalQuestions: questions.length,
      xpEarned: totalXP,
      answers: results.map(r => ({
        questionId: r.questionId,
        selectedAnswer: r.selectedAnswer,
        isCorrect: r.isCorrect
      }))
    });

    // Add XP to user
    const user = await User.findById(req.user._id);
    const xpResult = await user.addXP(totalXP);

    res.json({
      success: true,
      message: `Quiz completed! You scored ${score}/${questions.length}`,
      data: {
        score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        xpEarned: totalXP,
        results,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
        currentXP: xpResult.newXP
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
});

// @route   GET /api/quiz/history
// @desc    Get user's quiz history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const quizResults = await QuizResult.find({ user: req.user._id })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await QuizResult.countDocuments({ user: req.user._id });

    // Calculate stats
    const stats = await QuizResult.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalXP: { $sum: '$xpEarned' },
          avgScore: { $avg: { $divide: ['$score', '$totalQuestions'] } },
          perfectScores: {
            $sum: { $cond: [{ $eq: ['$score', '$totalQuestions'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        quizResults,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          totalQuizzes: 0,
          totalXP: 0,
          avgScore: 0,
          perfectScores: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz history',
      error: error.message
    });
  }
});

// @route   GET /api/quiz/categories
// @desc    Get available quiz categories
// @access  Private
router.get('/categories', protect, async (req, res) => {
  try {
    const categories = await QuizQuestion.distinct('category');
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
});

export default router;




