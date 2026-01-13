import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, 
  Camera, 
  Sparkles, 
  Clock,
  Flame,
  Apple,
  X,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mealsAPI } from "@/lib/api";
import { toast } from "sonner";

interface MealEntry {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  imageUrl?: string;
  isAIDetected?: boolean;
}

interface AnalyzedMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: number;
  description: string;
  healthTips: string[];
}

export function MealTracker() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedMeal, setAnalyzedMeal] = useState<AnalyzedMeal | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch meals on mount
  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await mealsAPI.getMeals(today);
      setMeals(response.data.meals);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setIsUploading(true);
        setAnalyzedMeal(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    try {
      const response = await mealsAPI.analyzeMeal(file);
      setAnalyzedMeal(response.data.nutrition);
      toast.success('Meal analyzed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze meal');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (!analyzedMeal || !uploadedImage) return;

    try {
      await mealsAPI.saveAnalyzedMeal({
        name: analyzedMeal.name,
        calories: analyzedMeal.calories,
        protein: analyzedMeal.protein,
        carbs: analyzedMeal.carbs,
        fat: analyzedMeal.fat,
        mealType: 'snack',
        imageUrl: uploadedImage,
        aiConfidence: analyzedMeal.confidence
      });
      
      toast.success('Meal saved! +15 XP');
      setIsUploading(false);
      setUploadedImage(null);
      setAnalyzedMeal(null);
      fetchMeals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save meal');
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await mealsAPI.deleteMeal(id);
      setMeals(meals.filter(m => m._id !== id));
      toast.success('Meal deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete meal');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/10">
            <Utensils className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Meal Tracker</h2>
            <p className="text-muted-foreground">Track your nutrition with AI-powered calorie detection</p>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          <Camera className="w-4 h-4 mr-2" />
          Scan Meal
        </Button>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 text-center"
        >
          <Flame className="w-5 h-5 text-accent mx-auto mb-2" />
          <p className="text-2xl font-display font-bold">{totalCalories}</p>
          <p className="text-xs text-muted-foreground">Calories</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 text-center"
        >
          <div className="w-5 h-5 mx-auto mb-2 rounded bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">P</div>
          <p className="text-2xl font-display font-bold">{totalProtein}g</p>
          <p className="text-xs text-muted-foreground">Protein</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 text-center"
        >
          <div className="w-5 h-5 mx-auto mb-2 rounded bg-success/20 text-success text-xs font-bold flex items-center justify-center">C</div>
          <p className="text-2xl font-display font-bold">{totalCarbs}g</p>
          <p className="text-xs text-muted-foreground">Carbs</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 text-center"
        >
          <div className="w-5 h-5 mx-auto mb-2 rounded bg-warning/20 text-warning text-xs font-bold flex items-center justify-center">F</div>
          <p className="text-2xl font-display font-bold">{totalFat}g</p>
          <p className="text-xs text-muted-foreground">Fat</p>
        </motion.div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-6 border-2 border-dashed border-primary/30"
          >
            <div className="flex items-start gap-4">
              {uploadedImage && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={uploadedImage} alt="Meal" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-display font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Calorie Detection (Powered by Gemini)
                </h4>
                
                {analyzedMeal ? (
                  <div className="space-y-3">
                    <p className="font-medium text-lg">{analyzedMeal.name}</p>
                    <p className="text-sm text-muted-foreground">{analyzedMeal.description}</p>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-center p-2 bg-secondary/50 rounded">
                        <p className="font-bold text-accent">{analyzedMeal.calories}</p>
                        <p className="text-xs text-muted-foreground">kcal</p>
                      </div>
                      <div className="text-center p-2 bg-secondary/50 rounded">
                        <p className="font-bold">{analyzedMeal.protein}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div className="text-center p-2 bg-secondary/50 rounded">
                        <p className="font-bold">{analyzedMeal.carbs}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div className="text-center p-2 bg-secondary/50 rounded">
                        <p className="font-bold">{analyzedMeal.fat}g</p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {analyzedMeal.confidence}%
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={saveMeal} className="bg-gradient-to-r from-primary to-accent">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Save Meal
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsUploading(false);
                          setUploadedImage(null);
                          setAnalyzedMeal(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our AI will analyze your meal and estimate calories, protein, carbs, and fat content.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        onClick={analyzeImage}
                        disabled={analyzing}
                        className="bg-gradient-to-r from-primary to-accent"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze Meal
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsUploading(false);
                          setUploadedImage(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meal List */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <Apple className="w-5 h-5 text-success" />
          Today's Meals
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No meals logged today</p>
            <p className="text-sm">Scan a meal to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal, index) => (
              <motion.div
                key={meal._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors group"
              >
                {meal.imageUrl ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Utensils className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate flex items-center gap-2">
                    {meal.name}
                    {meal.isAIDetected && (
                      <Sparkles className="w-3 h-3 text-primary" />
                    )}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {meal.time}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-accent">{meal.calories} kcal</p>
                  <p className="text-xs text-muted-foreground">
                    P:{meal.protein}g • C:{meal.carbs}g • F:{meal.fat}g
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() => deleteMeal(meal._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
