import { motion } from "framer-motion";
import { Activity as ActivityIcon } from "lucide-react";

const weekData = [
  { day: "Mon", calories: 1850, target: 2000 },
  { day: "Tue", calories: 2100, target: 2000 },
  { day: "Wed", calories: 1950, target: 2000 },
  { day: "Thu", calories: 1750, target: 2000 },
  { day: "Fri", calories: 2200, target: 2000 },
  { day: "Sat", calories: 1600, target: 2000 },
  { day: "Sun", calories: 1284, target: 2000 },
];

export function WeeklyActivity() {
  const maxCalories = Math.max(...weekData.map((d) => Math.max(d.calories, d.target)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-accent" />
          <h3 className="font-display text-lg font-semibold">Weekly Activity</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent" />
            <span className="text-muted-foreground">Burned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Target</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-40">
        {weekData.map((data, index) => {
          const barHeight = (data.calories / maxCalories) * 100;
          const targetHeight = (data.target / maxCalories) * 100;
          const isToday = index === weekData.length - 1;

          return (
            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full h-full flex items-end justify-center">
                {/* Target line */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-muted-foreground/30"
                  style={{ bottom: `${targetHeight}%` }}
                />
                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeight}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`w-full max-w-[2rem] rounded-t-lg ${
                    isToday
                      ? "bg-gradient-to-t from-primary to-accent"
                      : "bg-gradient-to-t from-primary/60 to-primary/30"
                  }`}
                />
              </div>
              <span className={`text-xs ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                {data.day}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
