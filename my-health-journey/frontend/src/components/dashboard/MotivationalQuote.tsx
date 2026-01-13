import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { statsAPI } from "@/lib/api";

interface QuoteData {
  text: string;
  author: string;
}

export function MotivationalQuote() {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const response = await statsAPI.getQuote();
      setQuote(response.data.quote);
    } catch (error) {
      // Fallback quote
      setQuote({
        text: "The only bad workout is the one that didn't happen.",
        author: "Unknown"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Quote className="w-5 h-5 text-primary" />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={fetchQuote}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {quote && (
          <>
            <blockquote className="text-lg font-display italic mb-3">
              "{quote.text}"
            </blockquote>
            <p className="text-sm text-muted-foreground">— {quote.author}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}
