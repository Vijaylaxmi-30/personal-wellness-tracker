import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { DailyGoals } from "@/components/dashboard/DailyGoals";
import { WeeklyActivity } from "@/components/dashboard/WeeklyActivity";
import { MotivationalQuote } from "@/components/dashboard/MotivationalQuote";
import { BMICalculator } from "@/components/bmi/BMICalculator";
import { MealTracker } from "@/components/meals/MealTracker";
import { ActivityTracker } from "@/components/activity/ActivityTracker";
import { HealthQuiz } from "@/components/quiz/HealthQuiz";
import { AchievementsPanel } from "@/components/achievements/AchievementsPanel";
import { WeeklyReports } from "@/components/reports/WeeklyReports";
import { useAuth } from "@/context/AuthContext";
import { achievementsAPI } from "@/lib/api";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, xpToNextLevel } = useAuth();

  // Check achievements on mount
  useEffect(() => {
    const checkAchievements = async () => {
      try {
        await achievementsAPI.check();
      } catch (error) {
        console.log('Failed to check achievements');
      }
    };
    checkAchievements();
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'}! 👋
              </h1>
              <p className="text-muted-foreground">
                Let's crush your goals today. You're on a {user?.streak || 0} day streak!
              </p>
            </div>

            <StatsGrid />

            <div className="grid lg:grid-cols-2 gap-6">
              <DailyGoals />
              <WeeklyActivity />
            </div>

            <MotivationalQuote />
          </motion.div>
        );
      case "meals":
        return <MealTracker />;
      case "activity":
        return <ActivityTracker />;
      case "bmi":
        return <BMICalculator />;
      case "quiz":
        return <HealthQuiz />;
      case "achievements":
        return <AchievementsPanel />;
      case "reports":
        return <WeeklyReports />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="pl-20 lg:pl-64">
        <Header 
          streak={user?.streak || 0} 
          level={user?.level || 1} 
          xp={user?.xp || 0} 
          xpToNext={xpToNextLevel} 
        />
        
        <main className="p-4 lg:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Index;
