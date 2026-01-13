import { motion } from "framer-motion";
import { ChartBar, Download, Calendar, TrendingUp, TrendingDown, Flame, Footprints, Dumbbell, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeeklyReport {
  week: string;
  calories: { burned: number; consumed: number; trend: number };
  steps: { total: number; average: number; trend: number };
  workouts: { count: number; duration: number; trend: number };
  sleep: { average: number; trend: number };
}

const currentReport: WeeklyReport = {
  week: "Dec 25 - Dec 31, 2025",
  calories: { burned: 9850, consumed: 12400, trend: 8 },
  steps: { total: 58420, average: 8346, trend: 12 },
  workouts: { count: 5, duration: 215, trend: -5 },
  sleep: { average: 7.2, trend: 3 },
};

const weeklyData = [
  { week: "Week 1", calories: 8500 },
  { week: "Week 2", calories: 9200 },
  { week: "Week 3", calories: 8800 },
  { week: "Week 4", calories: 9850 },
];

export function WeeklyReports() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <ChartBar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Weekly Reports</h2>
            <p className="text-muted-foreground">Track your progress over time</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Week Selector */}
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <span className="font-medium">{currentReport.week}</span>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <Flame className="w-5 h-5 text-accent" />
            <span className={`flex items-center text-xs font-medium ${
              currentReport.calories.trend > 0 ? "text-success" : "text-destructive"
            }`}>
              {currentReport.calories.trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(currentReport.calories.trend)}%
            </span>
          </div>
          <p className="text-2xl font-display font-bold">{currentReport.calories.burned.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Calories Burned</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <Footprints className="w-5 h-5 text-primary" />
            <span className={`flex items-center text-xs font-medium ${
              currentReport.steps.trend > 0 ? "text-success" : "text-destructive"
            }`}>
              {currentReport.steps.trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(currentReport.steps.trend)}%
            </span>
          </div>
          <p className="text-2xl font-display font-bold">{currentReport.steps.total.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Steps</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <Dumbbell className="w-5 h-5 text-success" />
            <span className={`flex items-center text-xs font-medium ${
              currentReport.workouts.trend > 0 ? "text-success" : "text-destructive"
            }`}>
              {currentReport.workouts.trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(currentReport.workouts.trend)}%
            </span>
          </div>
          <p className="text-2xl font-display font-bold">{currentReport.workouts.count}</p>
          <p className="text-sm text-muted-foreground">Workouts ({currentReport.workouts.duration} min)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <Moon className="w-5 h-5 text-warning" />
            <span className={`flex items-center text-xs font-medium ${
              currentReport.sleep.trend > 0 ? "text-success" : "text-destructive"
            }`}>
              {currentReport.sleep.trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(currentReport.sleep.trend)}%
            </span>
          </div>
          <p className="text-2xl font-display font-bold">{currentReport.sleep.average}h</p>
          <p className="text-sm text-muted-foreground">Avg Sleep</p>
        </motion.div>
      </div>

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="font-display font-semibold mb-6">Monthly Calorie Trend</h3>
        <div className="flex items-end justify-between gap-4 h-48">
          {weeklyData.map((week, index) => {
            const maxCalories = Math.max(...weeklyData.map(w => w.calories));
            const height = (week.calories / maxCalories) * 100;
            const isCurrentWeek = index === weeklyData.length - 1;

            return (
              <div key={week.week} className="flex-1 flex flex-col items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {week.calories.toLocaleString()}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className={`w-full rounded-t-lg ${
                    isCurrentWeek
                      ? "bg-gradient-to-t from-primary to-accent"
                      : "bg-gradient-to-t from-primary/40 to-primary/20"
                  }`}
                />
                <span className={`text-xs ${isCurrentWeek ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {week.week}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 border-l-4 border-primary"
      >
        <h3 className="font-display font-semibold mb-3">🤖 AI Insights</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Great job! Your calorie burn increased by 8% compared to last week.</li>
          <li>• You're walking 12% more on average. Keep maintaining this pace!</li>
          <li>• Consider adding one more workout session to meet your weekly goal.</li>
          <li>• Your sleep quality improved. Consistency is paying off!</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
