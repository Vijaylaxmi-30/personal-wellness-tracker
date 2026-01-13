import { motion } from "framer-motion";
import { Flame, Footprints, Droplets } from "lucide-react";

interface ProgressItem {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const progressData: ProgressItem[] = [
  {
    label: "Calories",
    value: 73,
    max: 100,
    unit: "%",
    icon: Flame,
    color: "text-accent",
    bgColor: "stroke-accent"
  },
  {
    label: "Steps",
    value: 84,
    max: 100,
    unit: "%",
    icon: Footprints,
    color: "text-primary",
    bgColor: "stroke-primary"
  },
  {
    label: "Water",
    value: 6,
    max: 8,
    unit: "/8",
    icon: Droplets,
    color: "text-success",
    bgColor: "stroke-success"
  }
];

function CircularProgress({ value, max, color, size = 100 }: { value: number; max: number; color: string; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / max) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-secondary"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={color}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          strokeDasharray: circumference,
        }}
      />
    </svg>
  );
}

export function TodaysProgress() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <h3 className="font-display text-lg font-semibold mb-6">Today's Progress</h3>

      <div className="flex justify-around items-center">
        {progressData.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <CircularProgress 
                value={item.unit === "/8" ? item.value : item.value} 
                max={item.max} 
                color={item.bgColor}
                size={90}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-display font-bold ${item.color}`}>
                  {item.value}{item.unit === "%" ? "%" : ""}
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}



