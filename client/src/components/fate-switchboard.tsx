import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Skull, Timer, AlertTriangle, Sparkles, CheckCircle } from "lucide-react";
import type { ProjectWithAssets } from "@shared/schema";
import { StepIntro, useStepIntro } from "@/components/step-intro";
import { AnimatePresence } from "framer-motion";

const FATE_OPTIONS = [
  {
    id: "released",
    label: "Release It",
    icon: Rocket,
    color: "text-green-500",
    bgColor: "bg-green-500/10 border-green-500/30",
    description: "Ship it! Against all odds, your fake game is ready for the fake public.",
    subtitle: "The dream lives",
    confirmText: "This is it. You're actually doing it. Your game will be seen by... well, nobody real, but still.",
  },
  {
    id: "development_hell",
    label: "Development Hell",
    icon: Timer,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10 border-yellow-500/30",
    description: "It's not cancelled, it's just... taking a while. Years, probably. Decades, possibly.",
    subtitle: "Coming eventually™",
    confirmText: "Your game will join the ranks of Duke Nukem Forever and Cyberpunk pre-2020. Not dead, just... resting.",
  },
  {
    id: "graveyard",
    label: "Send to Graveyard",
    icon: Skull,
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/30",
    description: "It's over. The vision was too grand. The scope was too creepy. The funding ran out.",
    subtitle: "RIP in peace",
    confirmText: "Your game will be remembered fondly (by you, alone, at 3am). Press F to pay respects.",
  },
];

interface FateSwitchboardProps {
  project: ProjectWithAssets;
  onSelectFate?: (fate: string) => void;
}

export function FateSwitchboard({ project, onSelectFate }: FateSwitchboardProps) {
  const { showIntro, dismissIntro } = useStepIntro("fate-switchboard-intro");
  const [selectedFate, setSelectedFate] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const hasSprite = project.sprites.length > 0;
  const hasCharacter = project.characters.length > 0;
  const hasWorld = !!project.world;
  const completionPercentage = [hasSprite, hasCharacter, hasWorld].filter(Boolean).length * 33 + 1;

  const canRelease = hasSprite || hasCharacter || hasWorld;

  const handleSelectFate = (fateId: string) => {
    if (fateId === "released" && !canRelease) return;
    setSelectedFate(fateId);
    setIsConfirming(true);
  };

  const handleConfirm = () => {
    if (selectedFate) {
      onSelectFate?.(selectedFate);
    }
  };

  const selectedOption = FATE_OPTIONS.find(f => f.id === selectedFate);

  if (showIntro) {
    return (
      <AnimatePresence>
        <StepIntro
          icon={Sparkles}
          title="The Fate Switchboard"
          tagline="Where dreams go to be shipped, shelved, or buried"
          description={[
            "This is it. The final step. The moment where your fake game meets its fake destiny.",
            "In the real game industry, most projects never ship. They get cancelled, delayed indefinitely, or quietly buried while developers move on to 'exciting new opportunities.' It's not failure - it's just... game development.",
            "But here's the thing: even shipped games started as weird ideas that someone believed in. Undertale was made by one guy. Hollow Knight by three. The difference between a released game and a cancelled one? Someone decided to finish it."
          ]}
          tips={[
            "RELEASE IT: Ship your game to the world! It's done! Perfect? No. But done? YES.",
            "DEVELOPMENT HELL: Not ready yet? Take your time. Duke Nukem did. (15 years, but still.)",
            "GRAVEYARD: Sometimes you gotta let go. Every dev has a graveyard. It's a rite of passage.",
            "There's no wrong choice here. Just different endings to the same story."
          ]}
          buttonText="Face Your Fate"
          onContinue={dismissIntro}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Fate Switchboard
              </CardTitle>
              <CardDescription>
                The moment of truth. What happens to "{project.title}"?
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono">
              {completionPercentage}% complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 rounded-lg bg-muted/50">
            <h3 className="font-medium mb-3">Project Status:</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                {hasSprite ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={hasSprite ? "text-foreground" : "text-muted-foreground"}>
                  Sprite Created
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasCharacter ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={hasCharacter ? "text-foreground" : "text-muted-foreground"}>
                  Character Forged
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasWorld ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={hasWorld ? "text-foreground" : "text-muted-foreground"}>
                  World Built
                </span>
              </div>
            </div>
          </div>

          {!isConfirming ? (
            <div className="grid gap-4 md:grid-cols-3">
              {FATE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isDisabled = option.id === "released" && !canRelease;
                
                return (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all border-2 ${
                      isDisabled 
                        ? "opacity-50 cursor-not-allowed" 
                        : `hover-elevate ${option.bgColor}`
                    }`}
                    onClick={() => !isDisabled && handleSelectFate(option.id)}
                    data-testid={`button-fate-${option.id}`}
                  >
                    <CardContent className="p-6 text-center">
                      <Icon className={`h-12 w-12 mx-auto mb-4 ${option.color}`} />
                      <h3 className="font-bold text-lg mb-1">{option.label}</h3>
                      <p className="text-xs text-muted-foreground italic mb-3">
                        {option.subtitle}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                      {isDisabled && (
                        <Badge variant="outline" className="mt-3 text-xs">
                          Needs at least one asset
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className={`border-2 ${selectedOption?.bgColor}`}>
              <CardContent className="p-8 text-center">
                {selectedOption && (
                  <>
                    <selectedOption.icon className={`h-16 w-16 mx-auto mb-4 ${selectedOption.color}`} />
                    <h3 className="text-2xl font-bold mb-2">{selectedOption.label}?</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {selectedOption.confirmText}
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsConfirming(false)}
                        data-testid="button-cancel-fate"
                      >
                        Wait, let me reconsider
                      </Button>
                      <Button
                        onClick={handleConfirm}
                        className="gap-2"
                        data-testid="button-confirm-fate"
                      >
                        <Sparkles className="h-4 w-4" />
                        Seal Its Fate
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
