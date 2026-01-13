import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProgressRing } from "./ProgressRing";
import { Target, Dumbbell, Apple, Droplets, Loader2 } from "lucide-react";
import { statsAPI } from "@/lib/api";

interface GoalItemProps {
  icon: React.ElementType;
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  delay?: number;
}

function GoalItem({ icon: Icon, label, current, target, unit, color, delay = 0 }: GoalItemProps) {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-4"
    >
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">
            {current}/{target} {unit}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
            className={`h-full rounded-full ${color.replace("bg-", "bg-").replace("/10", "")}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function DailyGoals() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await statsAPI.getToday();
      setData(response.data);
    } catch (error) {
      console.log('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 flex items-center justify-center h-64"
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </motion.div>
    );
  }

  const stats = data?.stats || {};
  const goals = data?.goals || { workout: 60, calories: 2000, water: 8 };
  const overallProgress = data?.overallProgress || 0;

  const goalItems = [
    { 
      icon: Dumbbell, 
      label: "Workout", 
      current: stats.workoutMinutes || 0, 
      target: goals.workout, 
      unit: "min", 
      color: "bg-primary/10 text-primary" 
    },
    { 
      icon: Apple, 
      label: "Calories", 
      current: stats.caloriesConsumed || 0, 
      target: goals.calories, 
      unit: "kcal", 
      color: "bg-accent/10 text-accent" 
    },
    { 
      icon: Droplets, 
      label: "Water", 
      current: stats.waterIntake || 0, 
      target: goals.water, 
      unit: "glasses", 
      color: "bg-success/10 text-success" 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Daily Goals</h3>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Progress Ring */}
        <div className="flex-shrink-0">
          <ProgressRing progress={overallProgress}>
            <div className="text-center">
              <span className="text-3xl font-display font-bold">{overallProgress}%</span>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </ProgressRing>
        </div>

        {/* Goals List */}
        <div className="flex-1 w-full space-y-4">
          {goalItems.map((goal, index) => (
            <GoalItem key={goal.label} {...goal} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
