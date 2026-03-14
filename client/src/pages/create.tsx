import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SpriteEditor } from "@/components/sprite-editor";
import { CharacterForge } from "@/components/character-forge";
import { WorldAnvil } from "@/components/world-anvil";
import { CodeCauldron } from "@/components/code-cauldron";
import { FateSwitchboard } from "@/components/fate-switchboard";
import { OriginalityAlert } from "@/components/originality-alert";
import { detectOriginality, type OriginalityFlag } from "@/lib/originality-detector";
import { 
  Paintbrush, User, Globe, Code, Sparkles, ArrowLeft, 
  Rocket, Skull, Timer, CheckCircle 
} from "lucide-react";
import type { ProjectWithAssets } from "@shared/schema";

const STEPS = [
  { id: "sprite", label: "Sprite Lab", icon: Paintbrush, description: "Draw your pixel art masterpiece" },
  { id: "character", label: "Character Forge", icon: User, description: "Create memorable characters" },
  { id: "world", label: "World Anvil", icon: Globe, description: "Build your game world" },
  { id: "code", label: "Code Cauldron", icon: Code, description: "Learn real coding skills" },
  { id: "fate", label: "Fate", icon: Sparkles, description: "Decide your game's destiny" },
];

const GENRES = [
  "Roguelike (of course)",
  "Metroidvania",
  "Souls-like",
  "Cozy Farming Sim",
  "Deckbuilder",
  "Horror",
  "Platformer",
  "RPG",
  "Visual Novel",
  "Puzzle",
  "Survival",
  "Other (we'll figure it out)",
];

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sprite");
  const [isCreating, setIsCreating] = useState(!id);
  const [newTitle, setNewTitle] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [originalityFlags, setOriginalityFlags] = useState<OriginalityFlag[]>([]);
  const [codeComplete, setCodeComplete] = useState(false);

  const { data: project, isLoading } = useQuery<ProjectWithAssets>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  useEffect(() => {
    if (project?.currentStep) {
      setActiveTab(project.currentStep);
    }
  }, [project?.currentStep]);

  const createProjectMutation = useMutation({
    mutationFn: async (data: { title: string; genre: string }) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigate(`/create/${data.id}`);
      setIsCreating(false);
      toast({
        title: "Project created!",
        description: "Now let's make some art. Or at least try.",
      });
    },
  });

  const saveSpriteMutation = useMutation({
    mutationFn: async (data: { name: string; pixelData: string; palette: string[] }) => {
      const res = await apiRequest("POST", `/api/projects/${id}/sprites`, {
        ...data,
        width: 16,
        height: 16,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      setActiveTab("character");
      toast({
        title: "Sprite saved!",
        description: "It's beautiful. Well, it's something.",
      });
    },
  });

  const saveCharacterMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/projects/${id}/characters`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      setActiveTab("world");
      toast({
        title: "Character saved!",
        description: "Their tragic backstory is now canon.",
      });
    },
  });

  const saveWorldMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/projects/${id}/world`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      setActiveTab("code");
      toast({
        title: "World saved!",
        description: "The lore is deep. Now let's learn some real code!",
      });
    },
  });

  const updateFateMutation = useMutation({
    mutationFn: async (fate: string) => {
      const res = await apiRequest("PATCH", `/api/projects/${id}`, { fate });
      return res.json();
    },
    onSuccess: (_, fate) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      
      const messages: Record<string, { title: string; description: string }> = {
        released: {
          title: "SHIPPED!",
          description: "Against all odds, your game is released. Time to ignore all the bug reports.",
        },
        development_hell: {
          title: "Into the Void",
          description: "Your game will return... someday. Probably. Maybe.",
        },
        graveyard: {
          title: "Rest in Peace",
          description: "Your game is now a cautionary tale for other developers.",
        },
      };
      
      toast(messages[fate] || { title: "Fate sealed", description: "It is done." });
      navigate("/dashboard");
    },
  });

  const handleCreateProject = () => {
    if (!newTitle.trim()) return;
    const flags = detectOriginality({ title: newTitle.trim() });
    setOriginalityFlags(flags);
    createProjectMutation.mutate({ title: newTitle.trim(), genre: newGenre });
  };

  if (isCreating || !id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Start Your Game</CardTitle>
            <CardDescription>
              Every legendary game started with a terrible idea. Let's hear yours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Game Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Dark Souls of Farming Simulators"
                className="mt-1"
                data-testid="input-new-game-title"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pro tip: Add "Dark Souls of" to anything for instant credibility
              </p>
            </div>
            
            <div>
              <Label htmlFor="genre">Genre</Label>
              <select
                id="genre"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                data-testid="select-genre"
              >
                <option value="">Select a genre...</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <Button
              className="w-full"
              onClick={handleCreateProject}
              disabled={!newTitle.trim() || createProjectMutation.isPending}
              data-testid="button-create-project"
            >
              {createProjectMutation.isPending ? "Creating..." : "Begin the Journey"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <Skull className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This project may have been deleted or never existed.
            </p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (project.fate !== "in_progress") {
    const fateInfo: Record<string, { icon: any; color: string; label: string }> = {
      released: { icon: Rocket, color: "text-green-500", label: "Released" },
      development_hell: { icon: Timer, color: "text-yellow-500", label: "In Development Hell" },
      graveyard: { icon: Skull, color: "text-red-500", label: "In the Graveyard" },
    };
    const info = fateInfo[project.fate || ""] || fateInfo.graveyard;
    const Icon = info.icon;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-lg">
          <CardContent className="p-8 text-center">
            <Icon className={`h-16 w-16 mx-auto mb-4 ${info.color}`} />
            <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
            <Badge className="mb-4">{info.label}</Badge>
            <p className="text-muted-foreground mb-6">
              This project's fate has been sealed. It cannot be edited anymore.
            </p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/dashboard")}
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="font-semibold">{project.title}</h1>
              <p className="text-xs text-muted-foreground">
                {project.genre || "Genre TBD"} • In Progress
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isComplete = 
                (step.id === "sprite" && project.sprites.length > 0) ||
                (step.id === "character" && project.characters.length > 0) ||
                (step.id === "world" && !!project.world) ||
                (step.id === "code" && codeComplete);
              const isCurrent = activeTab === step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <Button
                    variant={isCurrent ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setActiveTab(step.id)}
                    data-testid={`button-step-${step.id}`}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="hidden md:inline">{step.label}</span>
                  </Button>
                  {i < STEPS.length - 1 && (
                    <div className="w-4 h-px bg-border mx-1 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden">
            {STEPS.map((step) => (
              <TabsTrigger key={step.id} value={step.id}>
                {step.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="sprite" className="mt-0">
            {originalityFlags.length > 0 && (
              <div className="mb-6">
                <OriginalityAlert 
                  flags={originalityFlags} 
                  onDismiss={() => setOriginalityFlags([])}
                />
              </div>
            )}
            <SpriteEditor
              spriteName={`${project.title} Sprite`}
              initialData={project.sprites[0]?.pixelData}
              onSave={(data) => {
                saveSpriteMutation.mutate({
                  name: `${project.title} Sprite`,
                  ...data,
                });
              }}
            />
          </TabsContent>

          <TabsContent value="character" className="mt-0">
            {originalityFlags.length > 0 && (
              <div className="mb-6">
                <OriginalityAlert 
                  flags={originalityFlags} 
                  onDismiss={() => setOriginalityFlags([])}
                />
              </div>
            )}
            <CharacterForge
              initialData={project.characters[0] ? {
                name: project.characters[0].name,
                role: project.characters[0].role || undefined,
                archetype: project.characters[0].archetype || undefined,
                backstory: project.characters[0].backstory || undefined,
                traits: project.characters[0].traits || undefined,
                catchphrase: project.characters[0].catchphrase || undefined,
              } : undefined}
              onSave={(data) => {
                const flags = detectOriginality({
                  title: project.title,
                  characterName: data.name,
                  characterBackstory: data.backstory,
                  characterRole: data.role,
                });
                setOriginalityFlags(flags);
                saveCharacterMutation.mutate(data);
              }}
            />
          </TabsContent>

          <TabsContent value="world" className="mt-0">
            <WorldAnvil
              initialData={project.world ? {
                setting: project.world.setting || undefined,
                lore: project.world.lore || undefined,
                mechanics: project.world.mechanics || undefined,
                inspirations: project.world.inspirations || undefined,
                tone: project.world.tone || undefined,
              } : undefined}
              onSave={(data) => {
                const flags = detectOriginality({
                  title: project.title,
                  tagline: project.tagline || undefined,
                  worldSetting: data.setting,
                  worldLore: data.lore,
                  worldMechanics: data.mechanics,
                });
                setOriginalityFlags(flags);
                saveWorldMutation.mutate(data);
              }}
            />
          </TabsContent>

          <TabsContent value="code" className="mt-0">
            <CodeCauldron
              projectId={parseInt(id)}
              onComplete={() => {
                setCodeComplete(true);
                setActiveTab("fate");
              }}
              onBack={() => setActiveTab("world")}
            />
          </TabsContent>

          <TabsContent value="fate" className="mt-0">
            {originalityFlags.length > 0 && (
              <div className="mb-6">
                <OriginalityAlert 
                  flags={originalityFlags} 
                  onDismiss={() => setOriginalityFlags([])}
                />
              </div>
            )}
            <FateSwitchboard
              project={project}
              onSelectFate={(fate) => updateFateMutation.mutate(fate)}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
