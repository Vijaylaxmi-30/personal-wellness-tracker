import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Play, 
  Pause,
  RotateCcw,
  Flame,
  Timer,
  Heart,
  TrendingUp,
  Dumbbell,
  Bike,
  Footprints,
  Loader2,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProgressRing } from "../dashboard/ProgressRing";
import { activityAPI } from "@/lib/api";
import { toast } from "sonner";

interface WorkoutSession {
  _id: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  date: string;
}

const activityIcons: Record<string, React.ElementType> = {
  'running': Footprints,
  'walking': Footprints,
  'cycling': Bike,
  'strength-training': Dumbbell,
  'default': Activity
};

export function ActivityTracker() {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [selectedType, setSelectedType] = useState("strength-training");
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activitiesRes, weeklyRes] = await Promise.all([
        activityAPI.getActivities(undefined, 5),
        activityAPI.getWeekly()
      ]);
      setRecentWorkouts(activitiesRes.data.activities);
      setWeeklyData(weeklyRes.data);
    } catch (error) {
      console.log('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setIsActive(true);
    const id = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const pauseTimer = () => {
    setIsActive(false);
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(0);
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const saveWorkout = async () => {
    if (time < 60) {
      toast.error('Workout must be at least 1 minute');
      return;
    }

    setSaving(true);
    try {
      const duration = Math.floor(time / 60);
      const response = await activityAPI.logActivity({
        type: selectedType,
        duration,
        intensity: 'moderate'
      });
      
      toast.success(response.message);
      resetTimer();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const weeklyGoal = weeklyData?.goal?.target || 420;
  const weeklyCompleted = weeklyData?.goal?.current || 0;
  const weeklyProgress = weeklyData?.goal?.progress || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-success/10">
          <Activity className="w-6 h-6 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">Activity Tracker</h2>
          <p className="text-muted-foreground">Monitor your workouts and calories burned</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Session */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            Active Session
          </h3>

          <div className="flex flex-col items-center">
            {/* Activity Type Selector */}
            <div className="w-full max-w-xs mb-6">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="running">🏃 Running</SelectItem>
                  <SelectItem value="walking">🚶 Walking</SelectItem>
                  <SelectItem value="cycling">🚴 Cycling</SelectItem>
                  <SelectItem value="swimming">🏊 Swimming</SelectItem>
                  <SelectItem value="strength-training">💪 Strength Training</SelectItem>
                  <SelectItem value="yoga">🧘 Yoga</SelectItem>
                  <SelectItem value="hiit">⚡ HIIT</SelectItem>
                  <SelectItem value="cardio">❤️ Cardio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative mb-6">
              <ProgressRing progress={isActive ? 50 : 0} size={200}>
                <div className="text-center">
                  <span className="text-4xl font-display font-bold">{formatTime(time)}</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isActive ? "Active" : "Paused"}
                  </p>
                </div>
              </ProgressRing>
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute top-2 right-2"
                >
                  <Heart className="w-6 h-6 text-accent" />
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="text-center px-4">
                <p className="text-2xl font-display font-bold text-accent">
                  {Math.floor(time * 0.1)}
                </p>
                <p className="text-xs text-muted-foreground">Est. Calories</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center px-4">
                <p className="text-2xl font-display font-bold text-primary">
                  {Math.floor(time / 60)}
                </p>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
            </div>

            <div className="flex gap-3">
              {!isActive ? (
                <Button 
                  onClick={startTimer}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button 
                  onClick={pauseTimer}
                  variant="secondary"
                  size="lg"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button 
                onClick={resetTimer}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              {time >= 60 && !isActive && (
                <Button 
                  onClick={saveWorkout}
                  disabled={saving}
                  className="bg-success hover:bg-success/90"
                  size="lg"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Weekly Progress
          </h3>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Activity Goal</span>
              <span className="text-sm font-medium">{weeklyCompleted}/{weeklyGoal} min</span>
            </div>
            <div className="h-4 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weeklyProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              />
            </div>
          </div>

          <h4 className="font-medium mb-4">Recent Workouts</h4>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : recentWorkouts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No workouts yet. Start tracking!</p>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((workout, index) => {
                const IconComponent = activityIcons[workout.type] || activityIcons.default;
                return (
                  <motion.div
                    key={workout._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50"
                  >
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{workout.type.replace('-', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(workout.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{workout.duration} min</p>
                      <p className="text-xs text-accent flex items-center gap-1 justify-end">
                        <Flame className="w-3 h-3" />
                        {workout.caloriesBurned} kcal
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
