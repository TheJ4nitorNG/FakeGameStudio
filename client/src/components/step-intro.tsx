import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StepIntroProps {
  icon: LucideIcon;
  title: string;
  tagline: string;
  description: string[];
  tips: string[];
  buttonText?: string;
  onContinue: () => void;
}

export function StepIntro({
  icon: Icon,
  title,
  tagline,
  description,
  tips,
  buttonText = "Let's Do This",
  onContinue,
}: StepIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[60vh] flex items-center justify-center p-4"
    >
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-lg text-muted-foreground mt-1">{tagline}</p>
            </div>
          </div>

          <div className="space-y-3 text-left">
            {description.map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-primary">
              What You'll Actually Do
            </h3>
            <ul className="space-y-2">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold">{i + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center pt-2">
            <Button
              size="lg"
              onClick={onContinue}
              className="px-8"
              data-testid="button-intro-continue"
            >
              {buttonText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function useStepIntro(storageKey: string) {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem(storageKey);
  });

  const dismissIntro = () => {
    sessionStorage.setItem(storageKey, "seen");
    setShowIntro(false);
  };

  return { showIntro, dismissIntro };
}
