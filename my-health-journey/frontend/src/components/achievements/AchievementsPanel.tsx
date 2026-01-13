import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, Lock, Flame, Target, Dumbbell, Droplets, Moon, Brain, Loader2, Footprints, Apple, Crown } from "lucide-react";
import { achievementsAPI } from "@/lib/api";
import { toast } from "sonner";

interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  xpReward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const iconMap: Record<string, React.ElementType> = {
  Star, Flame, Target, Dumbbell, Droplets, Moon, Brain, Trophy, Footprints, Apple, Crown, Medal
};

const rarityColors = {
  common: "from-muted to-muted-foreground/20",
  rare: "from-primary/30 to-primary/10",
  epic: "from-accent/30 to-accent/10",
  legendary: "from-warning/30 to-warning/10",
};

const rarityBorders = {
  common: "border-muted-foreground/30",
  rare: "border-primary/50",
  epic: "border-accent/50",
  legendary: "border-warning/50",
};

export function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, totalXPFromAchievements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await achievementsAPI.getAll();
      setAchievements(response.data.achievements);
      setStats(response.data.stats);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-warning/10">
            <Trophy className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Achievements</h2>
            <p className="text-muted-foreground">
              {stats.unlocked} of {stats.total} unlocked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
          <Medal className="w-5 h-5 text-warning" />
          <span className="font-display font-bold">{stats.totalXPFromAchievements} XP</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {achievements.map((achievement, index) => {
          const IconComponent = iconMap[achievement.icon] || Star;
          
          return (
            <motion.div
              key={achievement._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`glass-card p-5 relative overflow-hidden border-2 ${
                achievement.unlocked
                  ? rarityBorders[achievement.rarity]
                  : "border-transparent"
              }`}
            >
              {/* Background gradient for unlocked */}
              {achievement.unlocked && (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${rarityColors[achievement.rarity]} opacity-50`}
                />
              )}

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-primary/20 to-accent/20"
                      : "bg-secondary"
                  }`}
                >
                  {achievement.unlocked ? (
                    <IconComponent className="w-6 h-6 text-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                {/* Content */}
                <h4
                  className={`font-display font-semibold mb-1 ${
                    !achievement.unlocked && "text-muted-foreground"
                  }`}
                >
                  {achievement.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {achievement.description}
                </p>

                {/* Progress or XP */}
                {achievement.unlocked ? (
                  <div className="flex items-center gap-1 text-sm font-medium text-success">
                    <Star className="w-4 h-4" />
                    +{achievement.xpReward} XP earned
                  </div>
                ) : achievement.progress !== undefined && achievement.progress > 0 ? (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(achievement.progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${achievement.progress}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Not started</p>
                )}

                {/* Rarity badge */}
                <div
                  className={`absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                    achievement.rarity === "legendary"
                      ? "bg-warning/20 text-warning"
                      : achievement.rarity === "epic"
                      ? "bg-accent/20 text-accent"
                      : achievement.rarity === "rare"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {achievement.rarity}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
