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
  Trash2,
  Plus,
  Droplets,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mealsAPI, statsAPI } from "@/lib/api";
import { toast } from "sonner";

interface MealEntry {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  mealType: string;
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

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const SUGGESTED_MEALS = {
  breakfast: [
    { name: 'Oatmeal with Berries', calories: 320, protein: 12, carbs: 48, fat: 8 },
    { name: 'Eggs & Toast', calories: 350, protein: 18, carbs: 30, fat: 16 },
    { name: 'Greek Yogurt Parfait', calories: 280, protein: 15, carbs: 35, fat: 8 },
    { name: 'Smoothie Bowl', calories: 300, protein: 10, carbs: 45, fat: 6 },
    { name: 'Avocado Toast', calories: 290, protein: 8, carbs: 28, fat: 18 },
  ],
  lunch: [
    { name: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 20, fat: 25 },
    { name: 'Turkey Sandwich', calories: 420, protein: 28, carbs: 40, fat: 14 },
    { name: 'Quinoa Buddha Bowl', calories: 480, protein: 18, carbs: 55, fat: 16 },
    { name: 'Tuna Wrap', calories: 380, protein: 30, carbs: 35, fat: 12 },
    { name: 'Vegetable Soup & Bread', calories: 320, protein: 12, carbs: 48, fat: 8 },
  ],
  dinner: [
    { name: 'Grilled Salmon & Veggies', calories: 520, protein: 40, carbs: 25, fat: 28 },
    { name: 'Chicken Stir Fry', calories: 450, protein: 35, carbs: 35, fat: 18 },
    { name: 'Pasta with Meat Sauce', calories: 580, protein: 28, carbs: 65, fat: 20 },
    { name: 'Lean Beef & Rice', calories: 550, protein: 38, carbs: 50, fat: 18 },
    { name: 'Vegetable Curry & Rice', calories: 420, protein: 12, carbs: 60, fat: 14 },
  ],
  snack: [
    { name: 'Protein Shake', calories: 220, protein: 30, carbs: 15, fat: 5 },
    { name: 'Apple & Peanut Butter', calories: 250, protein: 6, carbs: 28, fat: 14 },
    { name: 'Mixed Nuts', calories: 180, protein: 5, carbs: 8, fat: 16 },
    { name: 'Protein Bar', calories: 200, protein: 20, carbs: 22, fat: 6 },
    { name: 'Cottage Cheese & Fruit', calories: 160, protein: 14, carbs: 18, fat: 2 },
  ],
};

export function MealTracker() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedMeal, setAnalyzedMeal] = useState<AnalyzedMeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal] = useState(8);
  const [editingMeal, setEditingMeal] = useState<string | null>(null);
  
  // New meal form state
  const [newMeal, setNewMeal] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    mealType: 'breakfast'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMeals();
    fetchWaterIntake();
  }, [selectedDate]);

  const fetchMeals = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await mealsAPI.getMeals(dateStr);
      setMeals(response.data.meals);
    } catch (error: any) {
      // If API fails, don't show error for demo purposes
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaterIntake = async () => {
    try {
      const response = await statsAPI.getToday();
      setWaterIntake(response.data.stats?.waterIntake || 0);
    } catch (error) {
      setWaterIntake(0);
    }
  };

  const addWater = async () => {
    try {
      await statsAPI.addWater(1);
      setWaterIntake(prev => prev + 1);
      toast.success('Water logged! 💧');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log water');
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
      setAnalyzedMeal(response.data);
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
      
      toast.success('Meal saved! +10 XP');
      setIsUploading(false);
      setUploadedImage(null);
      setAnalyzedMeal(null);
      fetchMeals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save meal');
    }
  };

  const handleAddMeal = async () => {
    if (!newMeal.name || !newMeal.calories) {
      toast.error('Please enter meal name and calories');
      return;
    }

    try {
      await mealsAPI.addMeal({
        name: newMeal.name,
        calories: parseInt(newMeal.calories),
        protein: parseInt(newMeal.protein) || 0,
        carbs: parseInt(newMeal.carbs) || 0,
        fat: parseInt(newMeal.fat) || 0,
        mealType: newMeal.mealType
      });
      
      toast.success('Meal added! +5 XP');
      setShowAddMeal(false);
      setNewMeal({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'breakfast' });
      fetchMeals();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add meal');
    }
  };

  const selectSuggestedMeal = (meal: typeof SUGGESTED_MEALS.breakfast[0], mealType: string) => {
    setNewMeal({
      name: meal.name,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fat: meal.fat.toString(),
      mealType
    });
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

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const getMealsByType = (type: string) => meals.filter(m => m.mealType === type);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/10">
            <Utensils className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Meal Tracker</h2>
            <p className="text-muted-foreground">Plan your meals & track nutrition</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button variant="outline" onClick={() => setShowAddMeal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Meal
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan Meal
          </Button>
        </div>
      </div>

      {/* Tabs for Today / Week Planning */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="today">Today's Meals</TabsTrigger>
          <TabsTrigger value="planner">Weekly Planner</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6 mt-6">
          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <p className="font-display font-semibold">
                {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigateDate('next')}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Daily Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
            {/* Water Intake */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-4 text-center col-span-2 lg:col-span-1"
            >
              <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-display font-bold">{waterIntake}/{waterGoal}</p>
              <p className="text-xs text-muted-foreground mb-2">Glasses of Water</p>
              <Button size="sm" variant="outline" onClick={addWater} className="w-full">
                <Plus className="w-3 h-3 mr-1" /> Add Glass
              </Button>
            </motion.div>
          </div>

          {/* Water Progress Bar */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-400" />
                <span className="font-medium">Daily Water Intake</span>
              </div>
              <span className="text-sm text-muted-foreground">{Math.round((waterIntake / waterGoal) * 100)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((waterIntake / waterGoal) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {waterIntake >= waterGoal 
                ? '🎉 Great job! You reached your water goal!' 
                : `${waterGoal - waterIntake} more glasses to reach your goal`}
            </p>
          </div>

          {/* Meals by Type */}
          <div className="space-y-6">
            {MEAL_TYPES.map((type) => {
              const typeMeals = getMealsByType(type);
              return (
                <div key={type} className="space-y-3">
                  <h3 className="font-display font-semibold capitalize flex items-center gap-2">
                    {type === 'breakfast' && '🌅'}
                    {type === 'lunch' && '☀️'}
                    {type === 'dinner' && '🌙'}
                    {type === 'snack' && '🍎'}
                    {type}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({typeMeals.reduce((sum, m) => sum + m.calories, 0)} kcal)
                    </span>
                  </h3>
                  
                  {typeMeals.length === 0 ? (
                    <div className="glass-card p-4 text-center text-muted-foreground border-dashed border-2">
                      <p className="text-sm">No {type} logged</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setNewMeal(prev => ({ ...prev, mealType: type }));
                          setShowAddMeal(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add {type}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {typeMeals.map((meal, index) => (
                        <motion.div
                          key={meal._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-secondary/80 flex items-center justify-center flex-shrink-0">
                            <Utensils className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate flex items-center gap-2">
                              {meal.name}
                              {meal.isAIDetected && <Sparkles className="w-3 h-3 text-primary" />}
                            </h4>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{meal.time}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-display font-bold text-accent">{meal.calories} kcal</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
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
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="planner" className="space-y-6 mt-6">
          {/* Weekly View */}
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Weekly Meal Planner
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Plan your meals for the week. Click on any day to add or edit meals.
            </p>
            
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day, index) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + index);
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isTodayDate = date.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDate(date);
                      setActiveTab('today');
                    }}
                    className={`p-3 rounded-xl text-center transition-all ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : isTodayDate
                        ? 'bg-accent/20 border-2 border-accent'
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <p className="text-xs font-medium">{day}</p>
                    <p className="text-lg font-bold">{date.getDate()}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Suggested Meals */}
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-4">💡 Suggested Meals</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Quick add healthy meal suggestions to your plan
            </p>
            
            <div className="space-y-6">
              {MEAL_TYPES.map((type) => (
                <div key={type}>
                  <h4 className="font-medium capitalize mb-3 flex items-center gap-2">
                    {type === 'breakfast' && '🌅'}
                    {type === 'lunch' && '☀️'}
                    {type === 'dinner' && '🌙'}
                    {type === 'snack' && '🍎'}
                    {type}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {SUGGESTED_MEALS[type as keyof typeof SUGGESTED_MEALS].map((meal, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          selectSuggestedMeal(meal, type);
                          setShowAddMeal(true);
                        }}
                        className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-left transition-all group"
                      >
                        <p className="font-medium text-sm truncate">{meal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {meal.calories} kcal • P:{meal.protein}g
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Water Recommendation */}
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              Daily Water Recommendation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-500/10 rounded-xl">
                <p className="text-3xl font-bold text-blue-400">8 Glasses</p>
                <p className="text-sm text-muted-foreground mt-1">Recommended daily intake (~2 liters)</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-xl">
                <h4 className="font-medium mb-2">Tips for staying hydrated:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Drink a glass when you wake up</li>
                  <li>• Keep a water bottle at your desk</li>
                  <li>• Drink before, during & after exercise</li>
                  <li>• Set hourly reminders</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Meal Modal */}
      <AnimatePresence>
        {showAddMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddMeal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-lg">Add Meal</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddMeal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="mealType">Meal Type</Label>
                  <Select value={newMeal.mealType} onValueChange={(v) => setNewMeal(prev => ({ ...prev, mealType: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                      <SelectItem value="lunch">☀️ Lunch</SelectItem>
                      <SelectItem value="dinner">🌙 Dinner</SelectItem>
                      <SelectItem value="snack">🍎 Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Meal Name</Label>
                  <Input 
                    id="name"
                    placeholder="e.g., Grilled Chicken Salad"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calories">Calories</Label>
                    <Input 
                      id="calories"
                      type="number"
                      placeholder="e.g., 450"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, calories: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input 
                      id="protein"
                      type="number"
                      placeholder="e.g., 35"
                      value={newMeal.protein}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, protein: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input 
                      id="carbs"
                      type="number"
                      placeholder="e.g., 20"
                      value={newMeal.carbs}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, carbs: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input 
                      id="fat"
                      type="number"
                      placeholder="e.g., 25"
                      value={newMeal.fat}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, fat: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddMeal} className="flex-1 bg-gradient-to-r from-primary to-accent">
                    <Check className="w-4 h-4 mr-2" />
                    Add Meal
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddMeal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload/Scan Modal */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 max-w-lg w-full"
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
                    AI Calorie Detection
                  </h4>
                  
                  {analyzedMeal ? (
                    <div className="space-y-3">
                      <p className="font-medium text-lg">{analyzedMeal.name}</p>
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
                        Our AI will analyze your meal and estimate nutritional content.
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
