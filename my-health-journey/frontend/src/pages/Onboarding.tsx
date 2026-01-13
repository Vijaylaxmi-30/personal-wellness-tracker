import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Scale, 
  Ruler, 
  Target,
  Flame,
  Droplets,
  Dumbbell,
  Moon,
  Footprints,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/context/AuthContext";
import { userAPI } from "@/lib/api";
import { toast } from "sonner";

const avatarSeeds = [
  "fitness", "athlete", "runner", "yoga", "health", 
  "strong", "active", "energy", "wellness", "vitality"
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    gender: "male",
    dateOfBirth: "",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=fitness`,
    goals: {
      calories: 2000,
      water: 8,
      workout: 60,
      steps: 10000,
      sleep: 8
    }
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Update profile
      await userAPI.updateProfile({
        weight: parseFloat(formData.weight) || null,
        height: parseFloat(formData.height) || null,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || null,
        avatar: formData.avatar
      });

      // Update goals
      await userAPI.updateGoals(formData.goals);

      // Update local user state
      updateUser({
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        gender: formData.gender,
        avatar: formData.avatar,
        goals: formData.goals
      });

      toast.success("Profile setup complete! Let's start your health journey! 🎉");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Tell us about yourself</h2>
              <p className="text-muted-foreground">This helps us personalize your experience</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-muted-foreground" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 70"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
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
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="bg-secondary/50 border-transparent focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">Gender</Label>
                <RadioGroup 
                  value={formData.gender} 
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="bg-secondary/50 border-transparent focus:border-primary/50"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Set your daily goals</h2>
              <p className="text-muted-foreground">We'll help you track these every day</p>
            </div>

            <div className="space-y-6">
              {/* Calories Goal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-accent" />
                    Daily Calories
                  </Label>
                  <span className="font-bold text-accent">{formData.goals.calories} kcal</span>
                </div>
                <Slider
                  value={[formData.goals.calories]}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    goals: { ...formData.goals, calories: value[0] }
                  })}
                  min={1200}
                  max={4000}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Water Goal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-success" />
                    Water Intake
                  </Label>
                  <span className="font-bold text-success">{formData.goals.water} glasses</span>
                </div>
                <Slider
                  value={[formData.goals.water]}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    goals: { ...formData.goals, water: value[0] }
                  })}
                  min={4}
                  max={16}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Workout Goal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    Workout Time
                  </Label>
                  <span className="font-bold text-primary">{formData.goals.workout} min</span>
                </div>
                <Slider
                  value={[formData.goals.workout]}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    goals: { ...formData.goals, workout: value[0] }
                  })}
                  min={15}
                  max={120}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Footprints className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">More goals</h2>
              <p className="text-muted-foreground">Fine-tune your daily targets</p>
            </div>

            <div className="space-y-6">
              {/* Steps Goal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-primary" />
                    Daily Steps
                  </Label>
                  <span className="font-bold text-primary">{formData.goals.steps.toLocaleString()}</span>
                </div>
                <Slider
                  value={[formData.goals.steps]}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    goals: { ...formData.goals, steps: value[0] }
                  })}
                  min={3000}
                  max={20000}
                  step={1000}
                  className="w-full"
                />
              </div>

              {/* Sleep Goal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-warning" />
                    Sleep Hours
                  </Label>
                  <span className="font-bold text-warning">{formData.goals.sleep} hours</span>
                </div>
                <Slider
                  value={[formData.goals.sleep]}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    goals: { ...formData.goals, sleep: value[0] }
                  })}
                  min={5}
                  max={12}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Choose your avatar</h2>
              <p className="text-muted-foreground">Pick one that represents you</p>
            </div>

            <div className="flex justify-center mb-6">
              <motion.div
                key={formData.avatar}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden"
              >
                <img src={formData.avatar} alt="Avatar" className="w-full h-full" />
              </motion.div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {avatarSeeds.map((seed) => {
                const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                const isSelected = formData.avatar === avatarUrl;
                
                return (
                  <motion.button
                    key={seed}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, avatar: avatarUrl })}
                    className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                      isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <img src={avatarUrl} alt={seed} className="w-full h-full" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full mx-1 transition-colors ${
                  i < step ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className={step === 1 ? "invisible" : ""}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <>
                    Complete Setup
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Skip option */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate("/")}
          className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors"
        >
          Skip for now
        </motion.button>
      </motion.div>
    </div>
  );
}


