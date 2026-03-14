import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, X, Plus, Lightbulb } from "lucide-react";
import { StepIntro, useStepIntro } from "@/components/step-intro";
import { AnimatePresence } from "framer-motion";

const TONE_OPTIONS = [
  { value: "dark", label: "Dark & Gritty", description: "Everything is grey and everyone is morally ambiguous" },
  { value: "hopeful", label: "Hopeful & Bright", description: "Friendship is magic, literally" },
  { value: "comedic", label: "Comedic", description: "The world is absurd and knows it" },
  { value: "horror", label: "Horror", description: "Something is always watching" },
  { value: "epic", label: "Epic Fantasy", description: "Prophecies, chosen ones, world-ending threats" },
  { value: "cozy", label: "Cozy", description: "Wholesome vibes, low stakes, maximum comfort" },
  { value: "cyberpunk", label: "Cyberpunk", description: "High tech, low life, neon everything" },
  { value: "absurdist", label: "Absurdist", description: "Nothing makes sense and that's the point" },
];

const INSPIRATION_SUGGESTIONS = [
  "Dark Souls", "Zelda", "Studio Ghibli", "Hollow Knight", "Undertale",
  "Disco Elysium", "Hades", "Stardew Valley", "Elden Ring", "Celeste",
  "Outer Wilds", "Portal", "Metroid", "Final Fantasy", "Persona",
];

interface WorldAnvilProps {
  onSave?: (data: {
    setting: string;
    lore: string;
    mechanics: string;
    inspirations: string[];
    tone: string;
  }) => void;
  initialData?: {
    setting?: string;
    lore?: string;
    mechanics?: string;
    inspirations?: string[];
    tone?: string;
  };
}

export function WorldAnvil({ onSave, initialData }: WorldAnvilProps) {
  const { showIntro, dismissIntro } = useStepIntro("world-anvil-intro");
  const [setting, setSetting] = useState(initialData?.setting || "");
  const [lore, setLore] = useState(initialData?.lore || "");
  const [mechanics, setMechanics] = useState(initialData?.mechanics || "");
  const [inspirations, setInspirations] = useState<string[]>(initialData?.inspirations || []);
  const [tone, setTone] = useState(initialData?.tone || "");
  const [newInspiration, setNewInspiration] = useState("");

  const addInspiration = (insp: string) => {
    if (insp && !inspirations.includes(insp) && inspirations.length < 5) {
      setInspirations([...inspirations, insp]);
      setNewInspiration("");
    }
  };

  const removeInspiration = (insp: string) => {
    setInspirations(inspirations.filter(i => i !== insp));
  };

  const handleSave = () => {
    onSave?.({
      setting,
      lore,
      mechanics,
      inspirations,
      tone,
    });
  };

  const selectedTone = TONE_OPTIONS.find(t => t.value === tone);

  if (showIntro) {
    return (
      <AnimatePresence>
        <StepIntro
          icon={Globe}
          title="Welcome to World Anvil"
          tagline="Where lore goes to be ignored by speedrunners"
          description={[
            "Worldbuilding! The thing you'll spend 400 hours on that players will skip through in 3 seconds.",
            "But seriously - every great game needs a world that feels alive. Dark Souls has its interconnected kingdoms. Hollow Knight has Hallownest. Stardew Valley has... a really nice farm. The setting is the stage for everything else.",
            "The trick is to create enough lore to feel immersive, but not so much that you need a wiki to understand the tutorial. Unless you're making a Souls-like, in which case - more obscure the better."
          ]}
          tips={[
            "Describe your setting. Is it a dying kingdom? A cozy village? The inside of a computer? Go wild.",
            "Pick a tone. This determines if players will cry, laugh, or scream at their monitor.",
            "Add some lore. Not too much - just enough to put on loading screens and item descriptions.",
            "List your inspirations. It's okay to steal from the greats. They stole from each other too."
          ]}
          buttonText="Build a World"
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
                <Globe className="h-5 w-5" />
                World Anvil
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Build the world your players will speedrun through
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="world-setting">Setting</Label>
                <Textarea
                  id="world-setting"
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  placeholder="A dying kingdom where magic is fading, technology is rising, and everyone has trust issues..."
                  className="mt-1 min-h-24"
                  data-testid="textarea-setting"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Where does this game take place? Be vague enough to avoid plot holes.
                </p>
              </div>

              <div>
                <Label htmlFor="world-tone">Tone & Atmosphere</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-1" data-testid="select-tone">
                    <SelectValue placeholder="How should players feel?" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTone && (
                  <p className="text-xs text-muted-foreground italic mt-1">
                    {selectedTone.description}
                  </p>
                )}
              </div>

              <div>
                <Label>Inspirations ({inspirations.length}/5)</Label>
                <div className="flex flex-wrap gap-1 mt-2 min-h-8">
                  {inspirations.map((insp) => (
                    <Badge
                      key={insp}
                      variant="secondary"
                      className="gap-1 cursor-pointer"
                      onClick={() => removeInspiration(insp)}
                    >
                      {insp}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newInspiration}
                    onChange={(e) => setNewInspiration(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addInspiration(newInspiration)}
                    placeholder="Add an inspiration..."
                    className="flex-1"
                    data-testid="input-new-inspiration"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => addInspiration(newInspiration)}
                    disabled={inspirations.length >= 5}
                    data-testid="button-add-inspiration"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {INSPIRATION_SUGGESTIONS.filter(i => !inspirations.includes(i)).slice(0, 6).map((insp) => (
                    <Badge
                      key={insp}
                      variant="outline"
                      className="cursor-pointer hover-elevate text-xs"
                      onClick={() => addInspiration(insp)}
                    >
                      + {insp}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="world-lore" className="flex items-center gap-2">
                  Deep Lore
                  <Lightbulb className="h-3 w-3 text-muted-foreground" />
                </Label>
                <Textarea
                  id="world-lore"
                  value={lore}
                  onChange={(e) => setLore(e.target.value)}
                  placeholder="Long ago, the Ancient Ones sealed away the Ultimate Evil using the Seven MacGuffins. But now, the seals are breaking..."
                  className="mt-1 min-h-32"
                  data-testid="textarea-lore"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Backstory nobody will read but you'll spend hours writing anyway.
                </p>
              </div>

              <div>
                <Label htmlFor="world-mechanics">Core Mechanics</Label>
                <Textarea
                  id="world-mechanics"
                  value={mechanics}
                  onChange={(e) => setMechanics(e.target.value)}
                  placeholder="Players can double-jump, wall-slide, and pet every animal. There's a stamina meter that mostly just annoys people..."
                  className="mt-1 min-h-24"
                  data-testid="textarea-mechanics"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  What makes your game "innovative" (just like every other game)?
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="gap-2"
          data-testid="button-save-world"
        >
          Save World & Continue to Fate
        </Button>
      </div>
    </div>
  );
}
