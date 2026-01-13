import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Footprints, Droplets, Moon, TrendingUp, TrendingDown, Loader2, Plus, Minus } from "lucide-react";
import { statsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  trend: number;
  color: "primary" | "accent" | "success" | "warning";
  delay?: number;
  onAction?: () => void;
  actionLabel?: string;
}

function StatCard({ icon: Icon, label, value, unit, trend, color, delay = 0, onAction, actionLabel }: StatCardProps) {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 text-primary",
    accent: "from-accent/20 to-accent/5 text-accent",
    success: "from-success/20 to-success/5 text-success",
    warning: "from-warning/20 to-warning/5 text-warning",
  };

  const iconBgClasses = {
    primary: "bg-primary/10",
    accent: "bg-accent/10",
    success: "bg-success/10",
    warning: "bg-warning/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
          <Icon className={`w-5 h-5 ${colorClasses[color].split(" ")[1]}`} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : "text-muted-foreground"}`}>
          {trend !== 0 && (trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-display font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {onAction && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAction}
          className="mt-2 w-full text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}

export function StatsGrid() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await statsAPI.getToday();
      setStats(response.data);
    } catch (error) {
      console.log('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const addWater = async () => {
    try {
      await statsAPI.addWater(1);
      toast.success('Water logged! +2 XP');
      fetchStats();
    } catch (error) {
      toast.error('Failed to log water');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ))}
      </div>
    );
  }

  const todayStats = stats?.stats || {};
  const goals = stats?.goals || {};

  const statData = [
    { 
      icon: Flame, 
      label: "Calories Burned", 
      value: todayStats.caloriesBurned?.toLocaleString() || "0", 
      unit: "kcal", 
      trend: 12, 
      color: "accent" as const 
    },
    { 
      icon: Footprints, 
      label: "Steps Today", 
      value: todayStats.steps?.toLocaleString() || "0", 
      unit: "steps", 
      trend: 5, 
      color: "primary" as const 
    },
    { 
      icon: Droplets, 
      label: "Water Intake", 
      value: String(todayStats.waterIntake || 0), 
      unit: `/ ${goals.water || 8} glasses`, 
      trend: 0, 
      color: "success" as const,
      onAction: addWater,
      actionLabel: "Add Glass"
    },
    { 
      icon: Moon, 
      label: "Sleep Duration", 
      value: String(todayStats.sleepHours || 0), 
      unit: "hours", 
      trend: 8, 
      color: "warning" as const 
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statData.map((stat, index) => (
        <StatCard key={stat.label} {...stat} delay={index * 0.1} />
      ))}
    </div>
  );
}
