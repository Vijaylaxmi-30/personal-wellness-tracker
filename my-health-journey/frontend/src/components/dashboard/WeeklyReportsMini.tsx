import { motion } from "framer-motion";
import { FileText, TrendingUp, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeekReport {
  id: string;
  dateRange: string;
  badges: { label: string; color: string }[];
  healthScore: number;
  trend: "up" | "down" | "stable";
}

const recentReports: WeekReport[] = [
  {
    id: "1",
    dateRange: "Dec 23 - Dec 29",
    badges: [
      { label: "Lost 1.2 lbs", color: "bg-success/20 text-success" },
      { label: "+15% activity", color: "bg-primary/20 text-primary" },
      { label: "7-day streak", color: "bg-accent/20 text-accent" }
    ],
    healthScore: 92,
    trend: "up"
  },
  {
    id: "2",
    dateRange: "Dec 16 - Dec 22",
    badges: [
      { label: "Maintained weight", color: "bg-success/20 text-success" },
      { label: "+8% activity", color: "bg-primary/20 text-primary" },
      { label: "New PR: 5K run", color: "bg-warning/20 text-warning" }
    ],
    healthScore: 88,
    trend: "up"
  }
];

interface WeeklyReportsMiniProps {
  onViewAll?: () => void;
}

export function WeeklyReportsMini({ onViewAll }: WeeklyReportsMiniProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Weekly Reports</h3>
            <p className="text-sm text-muted-foreground">AI-generated insights</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={onViewAll}
        >
          <Calendar className="w-4 h-4" />
          View All
        </Button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {recentReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold">{report.dateRange}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {report.badges.map((badge, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrendingUp className={`w-4 h-4 ${report.trend === "up" ? "text-success" : "text-muted-foreground"}`} />
                  <span className="text-2xl font-display font-bold text-success">{report.healthScore}</span>
                </div>
                <p className="text-xs text-muted-foreground">Health Score</p>
              </div>
            </div>
            
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}



