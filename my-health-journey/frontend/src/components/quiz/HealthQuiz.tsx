import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronRight, CheckCircle2, XCircle, RefreshCw, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { quizAPI } from "@/lib/api";
import { toast } from "sonner";

interface Question {
  _id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

export function HealthQuiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Array<{ questionId: string; selectedAnswer: number }>>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await quizAPI.getQuestions(5);
      setQuestions(response.data.questions);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (index: number) => {
    if (selectedAnswer !== null || !questions[currentQuestion]) return;
    
    setSelectedAnswer(index);
    const newAnswers = [...answers, { 
      questionId: questions[currentQuestion]._id, 
      selectedAnswer: index 
    }];
    setAnswers(newAnswers);

    // If this is the last question, submit the quiz
    if (currentQuestion === questions.length - 1) {
      setSubmitting(true);
      try {
        const response = await quizAPI.submitQuiz(newAnswers);
        setScore(response.data.score);
        setResults(response.data.results);
        setXpEarned(response.data.xpEarned);
        setLeveledUp(response.data.leveledUp);
        
        // Show result briefly then complete
        setShowResult(true);
        setTimeout(() => {
          setQuizComplete(true);
        }, 2000);
      } catch (error: any) {
        toast.error(error.message || 'Failed to submit quiz');
      } finally {
        setSubmitting(false);
      }
    } else {
      setShowResult(true);
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }, 2000);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
    setAnswers([]);
    setResults([]);
    setXpEarned(0);
    setLeveledUp(false);
    fetchQuestions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">No quiz questions available</p>
        <Button onClick={fetchQuestions}>Try Again</Button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentResult = results.find(r => r.questionId === question?._id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-warning/10">
          <Brain className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">Daily Health Quiz</h2>
          <p className="text-muted-foreground">Build lasting habits with daily learning</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!quizComplete ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-6 lg:p-8"
            >
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="text-sm font-medium text-primary capitalize">
                    {question?.category}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </div>

              {/* Question */}
              <h3 className="text-xl font-display font-semibold mb-6">
                {question?.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {question?.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = currentResult?.correctAnswer === index;
                  const showCorrect = showResult && isCorrect;
                  const showIncorrect = showResult && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                      whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null || submitting}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${
                        showCorrect
                          ? "bg-success/20 border-2 border-success"
                          : showIncorrect
                          ? "bg-destructive/20 border-2 border-destructive"
                          : isSelected
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-secondary/50 border-2 border-transparent hover:border-primary/30"
                      }`}
                    >
                      <span className="font-medium">{option}</span>
                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                      {showIncorrect && <XCircle className="w-5 h-5 text-destructive" />}
                      {!showResult && !isSelected && (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showResult && currentResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 p-4 rounded-xl bg-secondary/50"
                  >
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Explanation: </span>
                      {currentResult.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {submitting && (
                <div className="flex items-center justify-center mt-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Submitting quiz...</span>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              >
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </motion.div>

              <h3 className="text-2xl font-display font-bold mb-2">Quiz Complete!</h3>
              <p className="text-muted-foreground mb-6">
                You scored {score} out of {questions.length}
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary mb-4">
                <span className="text-sm">+{xpEarned} XP earned</span>
              </div>

              {leveledUp && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30"
                >
                  <p className="text-lg font-bold text-primary">🎉 Level Up!</p>
                  <p className="text-sm text-muted-foreground">Congratulations on reaching the next level!</p>
                </motion.div>
              )}

              <Button
                onClick={restartQuiz}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
