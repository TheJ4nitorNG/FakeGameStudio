import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Plus, Rocket, Skull, Timer, Paintbrush, 
  Gamepad2, Clock, CheckCircle, ImageIcon
} from "lucide-react";
import type { Project } from "@shared/schema";

const FATE_CONFIG: Record<string, { icon: any; color: string; label: string; bgColor: string }> = {
  in_progress: { icon: Paintbrush, color: "text-blue-500", label: "In Progress", bgColor: "bg-blue-500/10" },
  released: { icon: Rocket, color: "text-green-500", label: "Released", bgColor: "bg-green-500/10" },
  development_hell: { icon: Timer, color: "text-yellow-500", label: "Dev Hell", bgColor: "bg-yellow-500/10" },
  graveyard: { icon: Skull, color: "text-red-500", label: "Graveyard", bgColor: "bg-red-500/10" },
};

function ProjectCard({ project }: { project: Project }) {
  const fate = project.fate || "in_progress";
  const config = FATE_CONFIG[fate] || FATE_CONFIG.in_progress;
  const Icon = config.icon;

  return (
    <Link href={fate === "in_progress" ? `/create/${project.id}` : `/project/${project.id}`}>
      <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-project-${project.id}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
              {project.tagline && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {project.tagline}
                </p>
              )}
            </div>
            <Badge className={`${config.bgColor} ${config.color} flex-shrink-0 gap-1`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {project.genre && (
              <span className="flex items-center gap-1">
                <Gamepad2 className="h-3 w-3" />
                {project.genre}
              </span>
            )}
            {project.updatedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState({ fate }: { fate: string }) {
  const messages: Record<string, { title: string; description: string }> = {
    in_progress: {
      title: "No Projects Yet",
      description: "Start your first fake game! Every masterpiece begins with a terrible idea.",
    },
    released: {
      title: "Nothing Released",
      description: "You haven't shipped anything yet. Classic indie dev behavior.",
    },
    development_hell: {
      title: "Dev Hell is Empty",
      description: "Nothing stuck in limbo... for now. Give it time.",
    },
    graveyard: {
      title: "Graveyard is Empty",
      description: "No cancelled projects? Are you even a real game developer?",
    },
  };

  const msg = messages[fate] || messages.in_progress;

  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">{msg.title}</h3>
        <p className="text-muted-foreground">{msg.description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const inProgress = projects.filter(p => p.fate === "in_progress");
  const released = projects.filter(p => p.fate === "released");
  const devHell = projects.filter(p => p.fate === "development_hell");
  const graveyard = projects.filter(p => p.fate === "graveyard");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-semibold">Fake Game Foundry</h1>
            <p className="text-xs text-muted-foreground">Your game dev journey (satirized)</p>
          </div>
          <div className="flex items-center gap-2">
            
            {/* NEW GALLERY BUTTON HERE */}
            <Link href="/gallery">
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-view-gallery">
                <ImageIcon className="h-4 w-4" />
                Gallery
              </Button>
            </Link>

            <Link href="/posts">
              <Button variant="ghost" size="sm" data-testid="button-view-feed">
                View Feed
              </Button>
            </Link>
            <ThemeToggle />
            <Link href="/create">
              <Button size="sm" className="gap-2" data-testid="button-new-project">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Paintbrush className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgress.length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Rocket className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{released.length}</p>
                <p className="text-xs text-muted-foreground">Released</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Timer className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{devHell.length}</p>
                <p className="text-xs text-muted-foreground">Dev Hell</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <Skull className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{graveyard.length}</p>
                <p className="text-xs text-muted-foreground">Graveyard</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="in_progress">
          <TabsList>
            <TabsTrigger value="in_progress" className="gap-2" data-testid="tab-in-progress">
              <Paintbrush className="h-4 w-4" />
              In Progress ({inProgress.length})
            </TabsTrigger>
            <TabsTrigger value="released" className="gap-2" data-testid="tab-released">
              <Rocket className="h-4 w-4" />
              Released ({released.length})
            </TabsTrigger>
            <TabsTrigger value="dev_hell" className="gap-2" data-testid="tab-dev-hell">
              <Timer className="h-4 w-4" />
              Dev Hell ({devHell.length})
            </TabsTrigger>
            <TabsTrigger value="graveyard" className="gap-2" data-testid="tab-graveyard">
              <Skull className="h-4 w-4" />
              Graveyard ({graveyard.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in_progress" className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : inProgress.length === 0 ? (
              <EmptyState fate="in_progress" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inProgress.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="released" className="mt-6">
            {released.length === 0 ? (
              <EmptyState fate="released" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {released.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dev_hell" className="mt-6">
            {devHell.length === 0 ? (
              <EmptyState fate="development_hell" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {devHell.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="graveyard" className="mt-6">
            {graveyard.length === 0 ? (
              <EmptyState fate="graveyard" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {graveyard.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
