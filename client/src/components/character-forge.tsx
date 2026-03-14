import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Sparkles, X, Plus } from "lucide-react";
import { StepIntro, useStepIntro } from "@/components/step-intro";
import { AnimatePresence } from "framer-motion";

const ARCHETYPES = [
  { value: "hero", label: "The Hero", description: "Destined to save everyone (and probably die trying)" },
  { value: "mentor", label: "The Mentor", description: "Exists solely to die in Act 2" },
  { value: "villain", label: "The Villain", description: "Had a sad childhood, it's complicated" },
  { value: "sidekick", label: "The Sidekick", description: "Comic relief with hidden depths" },
  { value: "love_interest", label: "Love Interest", description: "Has no personality besides being hot" },
  { value: "mysterious", label: "Mysterious Stranger", description: "Speaks in riddles, knows too much" },
  { value: "rival", label: "The Rival", description: "Pushes the hero to be better (or worse)" },
  { value: "shopkeeper", label: "Shopkeeper", description: "Sells suspicious items, asks no questions" },
];

const TRAIT_SUGGESTIONS = [
  "Brooding", "Sarcastic", "Naively optimistic", "Secretly scared",
  "Has amnesia (of course)", "Chosen one", "Orphan", "Royal blood",
  "Talks to inanimate objects", "Collects weird things", "Bad at lying",
  "Overly dramatic", "Chronically late", "Trust issues", "Secretly kind",
  "Allergic to magic", "Has a dark secret", "Never shuts up",
];

interface CharacterForgeProps {
  onSave?: (data: {
    name: string;
    role: string;
    archetype: string;
    backstory: string;
    traits: string[];
    catchphrase: string;
  }) => void;
  initialData?: {
    name?: string;
    role?: string;
    archetype?: string;
    backstory?: string;
    traits?: string[];
    catchphrase?: string;
  };
}

export function CharacterForge({ onSave, initialData }: CharacterForgeProps) {
  const { showIntro, dismissIntro } = useStepIntro("character-forge-intro");
  const [name, setName] = useState(initialData?.name || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [archetype, setArchetype] = useState(initialData?.archetype || "");
  const [backstory, setBackstory] = useState(initialData?.backstory || "");
  const [traits, setTraits] = useState<string[]>(initialData?.traits || []);
  const [catchphrase, setCatchphrase] = useState(initialData?.catchphrase || "");
  const [newTrait, setNewTrait] = useState("");

  const addTrait = (trait: string) => {
    if (trait && !traits.includes(trait) && traits.length < 5) {
      setTraits([...traits, trait]);
      setNewTrait("");
    }
  };

  const removeTrait = (trait: string) => {
    setTraits(traits.filter(t => t !== trait));
  };

  const generateRandomName = () => {
    const firstNames = ["Aiden", "Zara", "Kira", "Marcus", "Luna", "Vex", "Nova", "Ash", "Quinn", "Raven"];
    const lastNames = ["Shadowmend", "Brightbane", "Darkhollow", "Stormwind", "Ironheart", "Nightshade", "Flamecrest", "Frostborne"];
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    setName(`${first} ${last}`);
  };

  const handleSave = () => {
    if (!name) return;
    onSave?.({
      name,
      role,
      archetype,
      backstory,
      traits,
      catchphrase,
    });
  };

  const selectedArchetype = ARCHETYPES.find(a => a.value === archetype);

  if (showIntro) {
    return (
      <AnimatePresence>
        <StepIntro
          icon={User}
          title="Welcome to Character Forge"
          tagline="Where tragic backstories are born"
          description={[
            "Ah, character creation. The sacred art of giving pixels a personality and then making them suffer.",
            "Every great game has memorable characters. Sans from Undertale. The Knight from Hollow Knight. That one NPC you got weirdly attached to. Now it's your turn to create someone players will either love, hate, or write weird fan fiction about.",
            "Pro tip from the industry: Characters don't need to be original, they need to be interesting. Yes, your brooding hero with a dark past is cliche. But if their catchphrase is fire? Players won't care."
          ]}
          tips={[
            "Give your character a name. Yes, you have to. 'Player' is not a personality.",
            "Pick an archetype - it's basically a cheat sheet for character tropes that actually work.",
            "Write a backstory. It can be tragic, mysterious, or just 'they really like soup.' All valid.",
            "Add personality traits. Maximum 5, because even fictional people can't be that complicated."
          ]}
          buttonText="Forge Some Characters"
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
                <User className="h-5 w-5" />
                Character Forge
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create someone your players will pretend to care about
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="char-name">Character Name</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateRandomName}
                    className="h-6 text-xs gap-1"
                    data-testid="button-random-name"
                  >
                    <Sparkles className="h-3 w-3" />
                    Generate
                  </Button>
                </div>
                <Input
                  id="char-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Xander Darkflame III"
                  data-testid="input-character-name"
                />
              </div>

              <div>
                <Label htmlFor="char-role">Role in Story</Label>
                <Input
                  id="char-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Protagonist, Final Boss, That One NPC"
                  className="mt-1"
                  data-testid="input-character-role"
                />
              </div>

              <div>
                <Label htmlFor="char-archetype">Character Archetype</Label>
                <Select value={archetype} onValueChange={setArchetype}>
                  <SelectTrigger className="mt-1" data-testid="select-archetype">
                    <SelectValue placeholder="Select an archetype..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ARCHETYPES.map((arch) => (
                      <SelectItem key={arch.value} value={arch.value}>
                        {arch.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedArchetype && (
                  <p className="text-xs text-muted-foreground italic mt-1">
                    {selectedArchetype.description}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="char-catchphrase">Catchphrase</Label>
                <Input
                  id="char-catchphrase"
                  value={catchphrase}
                  onChange={(e) => setCatchphrase(e.target.value)}
                  placeholder='e.g., "I have a bad feeling about this..."'
                  className="mt-1"
                  data-testid="input-catchphrase"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Something they say way too often
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="char-backstory">Tragic Backstory</Label>
                <Textarea
                  id="char-backstory"
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="My parents were killed by [insert creature here], and now I must seek revenge while simultaneously finding myself..."
                  className="mt-1 min-h-32"
                  data-testid="textarea-backstory"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The sadder, the better. Dead parents are practically required.
                </p>
              </div>

              <div>
                <Label>Character Traits ({traits.length}/5)</Label>
                <div className="flex flex-wrap gap-1 mt-2 min-h-8">
                  {traits.map((trait) => (
                    <Badge
                      key={trait}
                      variant="secondary"
                      className="gap-1 cursor-pointer"
                      onClick={() => removeTrait(trait)}
                    >
                      {trait}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTrait(newTrait)}
                    placeholder="Add a trait..."
                    className="flex-1"
                    data-testid="input-new-trait"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => addTrait(newTrait)}
                    disabled={traits.length >= 5}
                    data-testid="button-add-trait"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {TRAIT_SUGGESTIONS.filter(t => !traits.includes(t)).slice(0, 6).map((trait) => (
                    <Badge
                      key={trait}
                      variant="outline"
                      className="cursor-pointer hover-elevate text-xs"
                      onClick={() => addTrait(trait)}
                    >
                      + {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!name}
          className="gap-2"
          data-testid="button-save-character"
        >
          Save Character & Continue
        </Button>
      </div>
    </div>
  );
}
