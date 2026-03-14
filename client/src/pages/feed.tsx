import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { FileText, Building2, Gamepad2, Filter, Calendar, Database, Code2, Rocket, Skull, Timer, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Project } from "@shared/schema";

const postTypes = [
  { value: "all", label: "All The Drama" },
  { value: "devlog", label: "Devlogs (Lies)" },
  { value: "patch_notes", label: "Patch Notes" },
  { value: "announcement", label: "Hype Trains" },
  { value: "apology", label: "Public Apologies" },
  { value: "cancellation", label: "RIP Projects" },
  { value: "postmortem", label: "Postmortems" },
];

const sarcasticLoadingMessages = [
  "Fetching broken promises...",
  "Loading missed deadlines...",
  "Downloading feature creep...",
  "Syncing crunch schedules...",
  "Parsing spaghetti code...",
  "Compiling excuses...",
];

const sarcasticEmptyMessages: Record<string, { title: string; message: string }> = {
  all: {
    title: "Suspiciously Quiet",
    message: "No posts yet. Everyone must be in mandatory crunch mode.",
  },
  devlog: {
    title: "No Devlogs Found",
    message: "All developers are currently in hiding after missing their Q4 milestones.",
  },
  patch_notes: {
    title: "Zero Patches",
    message: "Either every game is perfect, or everyone gave up. Probably the latter.",
  },
  announcement: {
    title: "No Announcements",
    message: "The marketing team is still recovering from the last failed launch.",
  },
  apology: {
    title: "No Apologies Yet",
    message: "Give it time. Someone will ship a broken build eventually.",
  },
  cancellation: {
    title: "Nothing Cancelled... Yet",
    message: "Suspicious. Check back after the next investor call.",
  },
  postmortem: {
    title: "No Postmortems",
    message: "The bodies haven't been found yet. Give it 6-12 months.",
  },
};

const postTypeColors: Record<string, string> = {
  devlog: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  patch_notes: "bg-green-500/10 text-green-600 dark:text-green-400",
  announcement: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  apology: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  cancellation: "bg-red-500/10 text-red-600 dark:text-red-400",
  postmortem: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

const FATE_CONFIG: Record<string, { icon: any; color: string; label: string; bgColor: string; description: string }> = {
  released: { 
    icon: Rocket, 
    color: "text-green-500", 
    label: "Released", 
    bgColor: "bg-green-500/10",
    description: "Games that actually shipped. Against all odds.",
  },
  development_hell: { 
    icon: Timer, 
    color: "text-yellow-500", 
    label: "Dev Hell", 
    bgColor: "bg-yellow-500/10",
    description: "Coming soon... eventually... maybe... probably not.",
  },
  graveyard: { 
    icon: Skull, 
    color: "text-red-500", 
    label: "Graveyard", 
    bgColor: "bg-red-500/10",
    description: "RIP. Gone but not forgotten. Actually, probably forgotten.",
  },
};

function ProjectCard({ project }: { project: Project }) {
  const fate = project.fate || "in_progress";
  const config = FATE_CONFIG[fate] || FATE_CONFIG.released;
  const Icon = config.icon;

  return (
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
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectGrid({ projects, fate }: { projects: Project[]; fate: string }) {
  const config = FATE_CONFIG[fate];
  const Icon = config?.icon || Rocket;

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon className={`h-16 w-16 mx-auto mb-4 text-muted-foreground`} />
          <h3 className="text-lg font-medium mb-2">
            {fate === "released" && "No Games Released Yet"}
            {fate === "development_hell" && "Dev Hell is Empty"}
            {fate === "graveyard" && "Graveyard is Empty"}
          </h3>
          <p className="text-muted-foreground">
            {fate === "released" && "Everyone is still too busy arguing about scope."}
            {fate === "development_hell" && "Give it time. The limbo fills up eventually."}
            {fate === "graveyard" && "No casualties yet. Suspicious optimism detected."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getExcerpt(bodyMd: string | null, maxLength = 150): string {
  if (!bodyMd) return "";
  const text = bodyMd
    .replace(/^#+\s/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/^-\s/gm, "")
    .trim();
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

export default function FeedPage() {
  const [filter, setFilter] = useState("all");
  const [mainTab, setMainTab] = useState("games");

  const { data: posts = [], isLoading: postsLoading } = useQuery<any[]>({
    queryKey: [`/api/posts?type=${filter}&limit=50`],
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const released = projects.filter(p => p.fate === "released");
  const devHell = projects.filter(p => p.fate === "development_hell");
  const graveyard = projects.filter(p => p.fate === "graveyard");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-dashboard">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold leading-none">Public Feed</h1>
              <p className="text-xs text-muted-foreground">Where games go to be judged</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="games" className="gap-2" data-testid="tab-games">
              <Gamepad2 className="h-4 w-4" />
              Games ({released.length + devHell.length + graveyard.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2" data-testid="tab-posts">
              <FileText className="h-4 w-4" />
              Posts ({posts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games">
            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Rocket className="h-5 w-5 text-green-500" />
                  <div>
                    <h2 className="text-lg font-semibold">Released Games</h2>
                    <p className="text-sm text-muted-foreground">{FATE_CONFIG.released.description}</p>
                  </div>
                </div>
                {projectsLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
                  </div>
                ) : (
                  <ProjectGrid projects={released} fate="released" />
                )}
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Timer className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h2 className="text-lg font-semibold">Development Hell</h2>
                    <p className="text-sm text-muted-foreground">{FATE_CONFIG.development_hell.description}</p>
                  </div>
                </div>
                {projectsLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
                  </div>
                ) : (
                  <ProjectGrid projects={devHell} fate="development_hell" />
                )}
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Skull className="h-5 w-5 text-red-500" />
                  <div>
                    <h2 className="text-lg font-semibold">The Graveyard</h2>
                    <p className="text-sm text-muted-foreground">{FATE_CONFIG.graveyard.description}</p>
                  </div>
                </div>
                {projectsLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
                  </div>
                ) : (
                  <ProjectGrid projects={graveyard} fate="graveyard" />
                )}
              </section>
            </div>
          </TabsContent>

          <TabsContent value="posts">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter by disappointment type</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {postTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={filter === type.value ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(type.value)}
                    data-testid={`filter-${type.value}`}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {postsLoading ? (
              <div className="space-y-4" data-testid="loading-skeleton">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card data-testid="empty-state">
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-xl font-semibold mb-2" data-testid="text-empty-title">
                    {sarcasticEmptyMessages[filter]?.title || "No Posts Found"}
                  </h2>
                  <p className="text-muted-foreground" data-testid="text-empty-message">
                    {sarcasticEmptyMessages[filter]?.message || "The void stares back."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4" data-testid="posts-list">
                {posts.map((post: any) => (
                  <Link key={post.id} href={`/posts/${post.id}`} data-testid={`link-post-${post.id}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`card-post-${post.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              {post.studio_name && (
                                <span className="flex items-center gap-1" data-testid={`text-studio-${post.id}`}>
                                  <Building2 className="h-3 w-3" />
                                  {post.studio_name}
                                </span>
                              )}
                              {post.game_title && (
                                <>
                                  <span>/</span>
                                  <span className="flex items-center gap-1" data-testid={`text-game-${post.id}`}>
                                    <Gamepad2 className="h-3 w-3" />
                                    {post.game_title}
                                  </span>
                                </>
                              )}
                            </div>
                            <CardTitle className="text-lg line-clamp-1" data-testid={`text-title-${post.id}`}>{post.title}</CardTitle>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {post.type && (
                              <Badge className={`text-xs ${postTypeColors[post.type] || ""}`} data-testid={`badge-type-${post.id}`}>
                                {formatStatus(post.type)}
                              </Badge>
                            )}
                            {post.version && (
                              <Badge variant="outline" className="font-mono text-xs" data-testid={`badge-version-${post.id}`}>
                                v{post.version}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {(post.excerpt || post.body_md) && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3" data-testid={`text-excerpt-${post.id}`}>
                            {post.excerpt || getExcerpt(post.body_md)}
                          </p>
                        )}
                        {post.created_at && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-date-${post.id}`}>
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.created_at)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
