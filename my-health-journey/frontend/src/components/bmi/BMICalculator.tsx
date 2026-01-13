import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Dumbbell, Scale, Ruler, ArrowRight, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProgressRing } from "../dashboard/ProgressRing";
import { bmiAPI } from "@/lib/api";
import { toast } from "sonner";

interface BMIResult {
  bmi: number;
  category: string;
  recommendations: string[];
  workoutPlan: Array<{ name: string; frequency: string; duration: string }>;
}

export function BMICalculator() {
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [gender, setGender] = useState<string>("male");
  const [fitnessLevel, setFitnessLevel] = useState<string>("beginner");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    
    if (w <= 0 || h <= 0) {
      toast.error('Please enter valid weight and height');
      return;
    }

    setLoading(true);
    try {
      const response = await bmiAPI.calculate(w, h, fitnessLevel);
      setResult(response.data);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.message || 'Failed to calculate BMI');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'underweight': return 'text-warning';
      case 'normal': return 'text-success';
      case 'overweight': return 'text-accent';
      case 'obese': return 'text-destructive';
      default: return 'text-foreground';
    }
  };

  const bmiProgress = result ? Math.min((result.bmi / 40) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-primary/10">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">BMI Calculator</h2>
          <p className="text-muted-foreground">Get personalized workout recommendations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-muted-foreground" />
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-secondary/50 border-transparent focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="e.g., 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="bg-secondary/50 border-transparent focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                Gender
              </Label>
              <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="cursor-pointer">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-muted-foreground" />
                Fitness Level
              </Label>
              <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                <SelectTrigger className="bg-secondary/50 border-transparent">
                  <SelectValue placeholder="Select fitness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleCalculate}
            disabled={!weight || !height || loading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Calculate BMI
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          {result ? (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <ProgressRing progress={bmiProgress} size={180}>
                  <div className="text-center">
                    <span className={`text-4xl font-display font-bold ${getCategoryColor(result.category)}`}>
                      {result.bmi}
                    </span>
                    <p className="text-sm text-muted-foreground">BMI</p>
                  </div>
                </ProgressRing>
              </div>

              <div className="text-center">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium capitalize ${getCategoryColor(result.category)} bg-secondary`}>
                  {result.category}
                </span>
              </div>

              {/* Workout Plan */}
              {result.workoutPlan && result.workoutPlan.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-primary" />
                    <h4 className="font-display font-semibold">Recommended Workout Plan</h4>
                  </div>
                  <div className="space-y-2">
                    {result.workoutPlan.map((workout, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <span className="font-medium">{workout.name}</span>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{workout.frequency}</p>
                          <p>{workout.duration}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Health Recommendations */}
              <div className="space-y-4">
                <h4 className="font-display font-semibold">Health Recommendations</h4>
                <ul className="space-y-2">
                  {result.recommendations.slice(0, 4).map((rec, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {rec}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                  <Calculator className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Enter your details to calculate BMI and get personalized recommendations
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
