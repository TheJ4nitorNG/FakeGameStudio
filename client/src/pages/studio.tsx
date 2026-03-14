import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Building2, Calendar, Gamepad2, FileText, Info, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { StudioWithGames } from "@shared/schema";

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 dark:text-green-400",
  acquired: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  bankrupt: "bg-red-500/10 text-red-600 dark:text-red-400",
  missing: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  hibernating: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

const studioStatusFlavor: Record<string, string> = {
  active: "Still somehow making games",
  acquired: "Sold their soul to a megacorp",
  bankrupt: "RIP in peace",
  missing: "Last seen entering a game jam",
  hibernating: "Taking an extended 'break'",
};

const sarcasticAboutLabels: Record<string, string> = {
  Founded: "Birth Year",
  Status: "Current Cope Level",
  Games: "Announced Projects",
  Posts: "Public Communications",
};

const gameStatusColors: Record<string, string> = {
  prototype: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  in_development: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  early_access: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  released: "bg-green-500/10 text-green-600 dark:text-green-400",
  canceled: "bg-red-500/10 text-red-600 dark:text-red-400",
  legendary: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export default function StudioPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: studio, isLoading, error } = useQuery<StudioWithGames>({
    queryKey: [`/api/studios/${slug}`],
  });

  const { data: posts = [] } = useQuery<any[]>({
    queryKey: [`/api/studios/${slug}/posts`],
    enabled: !!studio,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-48 bg-muted" />
        <div className="max-w-7xl mx-auto px-4 -mt-16">
          <div className="flex items-end gap-4 mb-8">
            <Skeleton className="w-32 h-32 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Studio Has Left The Building</h2>
            <p className="text-muted-foreground mb-4">This studio either went bankrupt, got acquired for pennies, or their founder ran off to start a blockchain gaming company.</p>
            <Link href="/posts">
              <Button>Flee to Safety</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div 
        className="h-48 md:h-64 bg-gradient-to-br from-primary/20 to-primary/5 relative"
        style={studio.bannerUrl ? { 
          backgroundImage: `url(${studio.bannerUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        {studio.bannerUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        )}
        <div className="absolute top-4 left-4">
          <Link href="/posts">
            <Button variant="ghost" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Studio Header */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-8">
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-card border-4 border-background flex items-center justify-center overflow-hidden">
            {studio.logoUrl ? (
              <img src={studio.logoUrl} alt={studio.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="h-12 w-12 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-studio-name">{studio.name}</h1>
              {studio.status && (
                <Badge className={statusColors[studio.status] || ""} data-testid="badge-studio-status">
                  {formatStatus(studio.status)}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {studio.foundingYear && `Allegedly founded ${studio.foundingYear}`}
              {studio.foundingYear && studio.status && " \u2022 "}
              {studio.games.length} {studio.games.length === 1 ? "Game" : "Games"} (announced, not necessarily shipped)
            </p>
            {studio.status && studioStatusFlavor[studio.status] && (
              <p className="text-xs text-muted-foreground/70 italic mt-1">
                {studioStatusFlavor[studio.status]}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {studio.bio && (
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl" data-testid="text-studio-bio">
            {studio.bio}
          </p>
        )}

        {/* Tabs */}
        <Tabs defaultValue="games" className="mb-12">
          <TabsList>
            <TabsTrigger value="games" className="gap-2" data-testid="tab-games">
              <Gamepad2 className="h-4 w-4" />
              Games
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2" data-testid="tab-posts">
              <FileText className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2" data-testid="tab-about">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="mt-6">
            {studio.games.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Suspiciously Empty Portfolio</h3>
                  <p className="text-muted-foreground">No games announced. Either they're still "prototyping" or the entire team pivoted to making NFT marketplaces.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studio.games.map((game) => (
                  <Link key={game.id} href={`/studios/${slug}/games/${game.slug}`}>
                    <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-game-${game.id}`}>
                      <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
                        {game.coverUrl ? (
                          <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Gamepad2 className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg line-clamp-1">{game.title}</CardTitle>
                          {game.status && (
                            <Badge variant="secondary" className={`text-xs flex-shrink-0 ${gameStatusColors[game.status] || ""}`}>
                              {formatStatus(game.status)}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {game.tagline && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{game.tagline}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {game.genre && <span>{game.genre}</span>}
                          {game.releaseYear && (
                            <>
                              <span className="text-border">\u2022</span>
                              <span>{game.releaseYear}</span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Radio Silence</h3>
                  <p className="text-muted-foreground">No devlogs, patch notes, or public apologies. The community manager is either on vacation or in witness protection.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <Link key={post.id} href={`/posts/${post.id}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`card-post-${post.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg" data-testid={`text-post-title-${post.id}`}>{post.title}</CardTitle>
                            {post.game_title && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-post-game-${post.id}`}>{post.game_title}</p>
                            )}
                          </div>
                          {post.type && (
                            <Badge variant="outline" className="text-xs flex-shrink-0" data-testid={`badge-post-type-${post.id}`}>
                              {formatStatus(post.type)}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-post-excerpt-${post.id}`}>{post.excerpt}</p>
                        )}
                      </CardContent>
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
                    <p className="text-sm text-muted-foreground">Birth Year</p>
                    <p className="font-medium">{studio.foundingYear || "Lost to time"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current State</p>
                    <p className="font-medium">{studio.status ? formatStatus(studio.status) : "Schrodinger's Studio"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Announced Projects</p>
                    <p className="font-medium">{studio.games.length} (shipped TBD)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Public Communications</p>
                    <p className="font-medium">{posts.length} {posts.length === 0 ? "(concerning)" : ""}</p>
                  </div>
                </div>
                {studio.bio && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Official Propaganda</p>
                    <p>{studio.bio}</p>
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
