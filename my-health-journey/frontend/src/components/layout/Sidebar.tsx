import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Utensils, 
  Activity, 
  Calculator, 
  Trophy,
  Brain,
  ChartBar,
  Settings,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import vitalsyncLogo from "@/assets/vitalsync-logo.png";

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Utensils, label: "Meals", id: "meals" },
  { icon: Activity, label: "Activity", id: "activity" },
  { icon: Calculator, label: "BMI", id: "bmi" },
  { icon: Brain, label: "Quiz", id: "quiz" },
  { icon: Trophy, label: "Achievements", id: "achievements" },
  { icon: ChartBar, label: "Reports", id: "reports" },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-card/50 backdrop-blur-xl border-r border-border/50 z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            <img src={vitalsyncLogo} alt="VitalSync" className="w-full h-full object-cover" />
          </div>
          <span className="hidden lg:block font-display text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            VitalSync
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="hidden lg:block ml-auto w-2 h-2 rounded-full bg-primary-foreground"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Theme Toggle & Settings */}
      <div className="p-4 border-t border-border/50 space-y-2">
        {/* Theme Toggle */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50">
          <Sun className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <span className="hidden lg:block font-medium flex-1">Theme</span>
          {mounted && (
            <Switch
              checked={resolvedTheme === 'dark'}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-primary"
            />
          )}
          <Moon className="w-5 h-5 text-blue-400 flex-shrink-0 hidden lg:block" />
        </div>

        {/* Settings Button */}
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200">
          <Settings className="w-5 h-5" />
          <span className="hidden lg:block font-medium">Settings</span>
        </button>
      </div>
    </motion.aside>
  );
}
