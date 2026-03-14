import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Gamepad2, FileText, Info, ArrowLeft, Calendar, Layers, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameWithStudio } from "@shared/schema";

const gameStatusColors: Record<string, string> = {
  prototype: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  in_development: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  early_access: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  released: "bg-green-500/10 text-green-600 dark:text-green-400",
  canceled: "bg-red-500/10 text-red-600 dark:text-red-400",
  legendary: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

const gameStatusFlavor: Record<string, string> = {
  prototype: "Exists purely in the minds of the devs",
  in_development: "Coming Soon (for the past 7 years)",
  early_access: "Pay to be a QA tester",
  released: "Against all odds, it shipped",
  canceled: "Gone but not forgotten (actually probably forgotten)",
  legendary: "The one that actually got good reviews",
};

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export default function GamePage() {
  const { studioSlug, gameSlug } = useParams<{ studioSlug: string; gameSlug: string }>();

  const { data: game, isLoading, error } = useQuery<GameWithStudio>({
    queryKey: [`/api/studios/${studioSlug}/games/${gameSlug}`],
  });

  const { data: allPosts = [] } = useQuery<any[]>({
    queryKey: [`/api/studios/${studioSlug}/games/${gameSlug}/posts`],
    enabled: !!game,
  });

  const devlogs = allPosts.filter((p: any) => p.type === "devlog");
  const patchNotes = allPosts.filter((p: any) => p.type === "patch_notes");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="aspect-[21/9] max-h-96 bg-muted" />
        <div className="max-w-5xl mx-auto px-4 -mt-16">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">This Game Has Been Cancelled</h2>
            <p className="text-muted-foreground mb-4">Classic move. The announcement trailer got 2M views but the project "pivoted" into a mobile gacha. Tale as old as time.</p>
            <Link href="/posts">
              <Button>Mourn Elsewhere</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div 
        className="aspect-[21/9] max-h-96 bg-gradient-to-br from-primary/20 to-primary/5 relative"
        style={game.coverUrl ? { 
          backgroundImage: `url(${game.coverUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        {game.coverUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        )}
        {!game.coverUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="h-24 w-24 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Link href={`/studios/${studioSlug}`}>
            <Button variant="ghost" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              {game.studio?.name || "Back"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Game Header */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-3xl md:text-5xl font-bold" data-testid="text-game-title">{game.title}</h1>
            {game.status && (
              <Badge className={`text-sm ${gameStatusColors[game.status] || ""}`} data-testid="badge-game-status">
                {formatStatus(game.status)}
              </Badge>
            )}
          </div>
          
          {game.status && gameStatusFlavor[game.status] && (
            <p className="text-xs text-muted-foreground/70 italic mb-2">
              {gameStatusFlavor[game.status]}
            </p>
          )}
          
          {game.tagline && (
            <p className="text-xl text-muted-foreground italic mb-4" data-testid="text-game-tagline">
              "{game.tagline}"
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            {game.platforms && game.platforms.length > 0 && (
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span>{game.platforms.join(" / ")}</span>
              </div>
            )}
            {game.genre && (
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>{game.genre}</span>
              </div>
            )}
            {game.releaseYear && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{game.releaseYear}</span>
              </div>
            )}
          </div>

          {/* Studio link */}
          {game.studio && (
            <Link href={`/studios/${studioSlug}`}>
              <Badge variant="outline" className="hover-elevate cursor-pointer" data-testid="link-studio">
                By {game.studio.name}
              </Badge>
            </Link>
          )}
        </div>

        {/* Description */}
        {game.description && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-game-description">
                {game.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="devlogs" className="mb-12">
          <TabsList>
            <TabsTrigger value="devlogs" className="gap-2" data-testid="tab-devlogs">
              <FileText className="h-4 w-4" />
              Devlogs
            </TabsTrigger>
            <TabsTrigger value="patch_notes" className="gap-2" data-testid="tab-patch-notes">
              <FileText className="h-4 w-4" />
              Patch Notes
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2" data-testid="tab-about">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devlogs" className="mt-6">
            {devlogs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Devlogs (Sus)</h3>
                  <p className="text-muted-foreground">Zero development updates. Either the team is "heads down building" or they're all playing the competitors' games.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {devlogs.map((post: any) => (
                  <Link key={post.id} href={`/posts/${post.id}`} data-testid={`link-devlog-${post.id}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`card-devlog-${post.id}`}>
                      <CardHeader>
                        <CardTitle data-testid={`text-devlog-title-${post.id}`}>{post.title}</CardTitle>
                      </CardHeader>
                      {post.excerpt && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-devlog-excerpt-${post.id}`}>{post.excerpt}</p>
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="patch_notes" className="mt-6">
            {patchNotes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Patch Notes? What's That?</h3>
                  <p className="text-muted-foreground">No patches on record. The game is either flawless (unlikely) or the team subscribes to the "ship it and forget it" philosophy.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {patchNotes.map((post: any) => (
                  <Link key={post.id} href={`/posts/${post.id}`} data-testid={`link-patch-${post.id}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`card-patch-${post.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle data-testid={`text-patch-title-${post.id}`}>{post.title}</CardTitle>
                          {post.version && (
                            <Badge variant="secondary" className="font-mono text-xs" data-testid={`badge-patch-version-${post.id}`}>
                              v{post.version}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      {post.excerpt && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-patch-excerpt-${post.id}`}>{post.excerpt}</p>
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Genre (Marketing Says)</p>
                    <p className="font-medium">{game.genre || "Genre-defying (unfinished)"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Copium Level</p>
                    <p className="font-medium">{game.status ? formatStatus(game.status) : "Schrodinger's Game"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Promised Platforms</p>
                    <p className="font-medium">{game.platforms?.join(", ") || "PC (maybe Switch later)"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Release Year</p>
                    <p className="font-medium">{game.releaseYear || "When it's done\u2122"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blamed Developer</p>
                    <p className="font-medium">{game.studio?.name || "Anonymous Indie"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PR Attempts</p>
                    <p className="font-medium">{allPosts.length} post{allPosts.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                {game.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Back-of-Box Marketing Speak</p>
                    <p className="whitespace-pre-wrap">{game.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
