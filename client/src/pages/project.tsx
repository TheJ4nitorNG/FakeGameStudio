import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  ArrowLeft, Rocket, Skull, Timer, Paintbrush, 
  User, Globe, Gamepad2, Clock, Calendar
} from "lucide-react";
import type { ProjectWithAssets } from "@shared/schema";

const FATE_CONFIG: Record<string, { icon: any; color: string; label: string; bgColor: string; message: string }> = {
  released: { 
    icon: Rocket, 
    color: "text-green-500", 
    label: "Released", 
    bgColor: "bg-green-500/10",
    message: "Against all odds, this game actually shipped. A rare victory.",
  },
  development_hell: { 
    icon: Timer, 
    color: "text-yellow-500", 
    label: "Development Hell", 
    bgColor: "bg-yellow-500/10",
    message: "Trapped in an eternal cycle of 'almost done' and 'just one more feature'.",
  },
  graveyard: { 
    icon: Skull, 
    color: "text-red-500", 
    label: "Graveyard", 
    bgColor: "bg-red-500/10",
    message: "Gone but not forgotten. Actually, probably forgotten. RIP.",
  },
  in_progress: { 
    icon: Paintbrush, 
    color: "text-blue-500", 
    label: "In Progress", 
    bgColor: "bg-blue-500/10",
    message: "Still being crafted. The dream lives... for now.",
  },
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery<ProjectWithAssets>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-40 w-full mb-6" />
          <Skeleton className="h-60 w-full" />
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Skull className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This project has vanished into the void. Classic.
            </p>
            <Link href="/">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fate = project.fate || "in_progress";
  const fateConfig = FATE_CONFIG[fate] || FATE_CONFIG.in_progress;
  const FateIcon = fateConfig.icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className={`mb-8 border-2 ${fateConfig.bgColor}`}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{project.title}</CardTitle>
                {project.tagline && (
                  <CardDescription className="text-lg">{project.tagline}</CardDescription>
                )}
              </div>
              <Badge className={`${fateConfig.bgColor} ${fateConfig.color} gap-2 text-base px-4 py-2`}>
                <FateIcon className="h-5 w-5" />
                {fateConfig.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic mb-4">{fateConfig.message}</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {project.genre && (
                <span className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  {project.genre}
                </span>
              )}
              {project.createdAt && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </span>
              )}
              {project.releasedAt && (
                <span className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Released: {new Date(project.releasedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Paintbrush className="h-5 w-5" />
                Sprites ({project.sprites?.length || 0})
              </CardTitle>
              <CardDescription>The artistic vision (16x16 pixels of glory)</CardDescription>
            </CardHeader>
            <CardContent>
              {project.sprites && project.sprites.length > 0 ? (
                <div className="space-y-3">
                  {project.sprites.map((sprite) => (
                    <div key={sprite.id} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium">{sprite.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sprite.width}x{sprite.height} pixels
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No sprites created. Programmer art was too scary to preserve.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Characters ({project.characters?.length || 0})
              </CardTitle>
              <CardDescription>The emotional labor (tragic backstories included)</CardDescription>
            </CardHeader>
            <CardContent>
              {project.characters && project.characters.length > 0 ? (
                <div className="space-y-3">
                  {project.characters.map((char) => (
                    <div key={char.id} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium">{char.name}</p>
                      {char.role && (
                        <p className="text-xs text-muted-foreground">{char.role}</p>
                      )}
                      {char.archetype && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {char.archetype}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No characters created. The game is now a walking simulator.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                World
              </CardTitle>
              <CardDescription>The worldbuilding (probably overwritten 12 times)</CardDescription>
            </CardHeader>
            <CardContent>
              {project.world ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {project.world.setting && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Setting</h4>
                      <p className="text-sm text-muted-foreground">{project.world.setting}</p>
                    </div>
                  )}
                  {project.world.tone && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Tone</h4>
                      <Badge variant="secondary">{project.world.tone}</Badge>
                    </div>
                  )}
                  {project.world.lore && (
                    <div className="p-4 rounded-lg bg-muted/50 md:col-span-2">
                      <h4 className="font-medium mb-2">Lore</h4>
                      <p className="text-sm text-muted-foreground">{project.world.lore}</p>
                    </div>
                  )}
                  {project.world.mechanics && (
                    <div className="p-4 rounded-lg bg-muted/50 md:col-span-2">
                      <h4 className="font-medium mb-2">Core Mechanics</h4>
                      <p className="text-sm text-muted-foreground">{project.world.mechanics}</p>
                    </div>
                  )}
                  {project.world.inspirations && project.world.inspirations.length > 0 && (
                    <div className="p-4 rounded-lg bg-muted/50 md:col-span-2">
                      <h4 className="font-medium mb-2">Inspirations</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.world.inspirations.map((insp, i) => (
                          <Badge key={i} variant="outline">{insp}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No world built. The game takes place in the abstract void of unfinished ideas.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
