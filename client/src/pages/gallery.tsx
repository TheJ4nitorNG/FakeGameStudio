import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Paintbrush, Users, ImageIcon, ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { Sprite, Character } from "@shared/schema";

// Custom type since we join the project title in the SQL query
type SpriteWithProject = Sprite & { project_title: string };
type CharacterWithProject = Character & { project_title: string };

// The magic thumbnail generator
function SpriteThumbnail({ pixelData, width = 16, height = 16 }: { pixelData: string, width?: number, height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !pixelData) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    try {
      const pixels: string[][] = JSON.parse(pixelData);
      const pixelSize = 4; // Scale it up by 4x for the thumbnail
      
      ctx.clearRect(0, 0, width * pixelSize, height * pixelSize);
      
      pixels.forEach((row, y) => {
        row.forEach((color, x) => {
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
          }
        });
      });
    } catch (e) {
      console.error("Failed to parse sprite data", e);
    }
  }, [pixelData, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width * 4} 
      height={height * 4} 
      className="mx-auto block bg-[repeating-conic-gradient(#e5e7eb_0_90deg,#fff_90deg_180deg)_0_0/8px_8px] dark:bg-[repeating-conic-gradient(#374151_0_90deg,#1f2937_90deg_180deg)_0_0/8px_8px] rounded"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export default function AssetGallery() {
  const { data: sprites, isLoading: loadingSprites } = useQuery<SpriteWithProject[]>({
    queryKey: ["/api/sprites"],
  });

  const { data: characters, isLoading: loadingCharacters } = useQuery<CharacterWithProject[]>({
    queryKey: ["/api/characters"],
  });

  if (loadingSprites || loadingCharacters) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Banner matching your studio layout */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-primary/20 to-primary/5 relative">
        <div className="absolute top-4 left-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-card border-4 border-background flex items-center justify-center overflow-hidden">
            <ImageIcon className="w-12 h-12 text-primary" />
          </div>
          <div className="pt-12 md:pt-16">
            <h1 className="text-3xl md:text-4xl font-bold">Asset Gallery</h1>
            <p className="text-muted-foreground mt-1">All your beautiful (and highly questionable) creations.</p>
          </div>
        </div>

        <Tabs defaultValue="sprites" className="w-full mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="sprites" className="gap-2">
              <Paintbrush className="w-4 h-4" />
              Sprites
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-2">
              <Users className="w-4 h-4" />
              Characters
            </TabsTrigger>
          </TabsList>

          {/* SPRITES TAB */}
          <TabsContent value="sprites">
            {(!sprites || sprites.length === 0) ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Paintbrush className="w-12 h-12 mb-4 opacity-20" />
                  <p>No sprites exist yet. Time to start clicking pixels!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {sprites.map((sprite) => (
                  <Card key={sprite.id} className="overflow-hidden group hover:border-primary transition-colors">
                    <CardContent className="p-4 bg-muted/30 flex items-center justify-center min-h-[120px]">
                      <div className="group-hover:scale-110 transition-transform">
                        <SpriteThumbnail pixelData={sprite.pixelData} width={sprite.width} height={sprite.height} />
                      </div>
                    </CardContent>
                    <CardHeader className="p-3 border-t bg-card">
                      <CardTitle className="text-sm truncate" title={sprite.name}>
                        {sprite.name}
                      </CardTitle>
                      <CardDescription className="text-xs truncate">
                        {sprite.project_title}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CHARACTERS TAB */}
          <TabsContent value="characters">
            {(!characters || characters.length === 0) ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mb-4 opacity-20" />
                  <p>No characters found. Your games are currently ghost towns.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((char) => (
                  <Card key={char.id} className="hover:border-primary transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{char.name}</CardTitle>
                        {char.role && <Badge variant="secondary">{char.role}</Badge>}
                      </div>
                      <CardDescription>Project: {char.project_title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {char.archetype && (
                        <p className="text-sm text-muted-foreground mb-3 font-medium">
                          Archetype: {char.archetype}
                        </p>
                      )}
                      {char.catchphrase && (
                        <p className="text-sm italic border-l-2 pl-3 py-1 bg-muted/30 mb-3">
                          "{char.catchphrase}"
                        </p>
                      )}
                      {char.traits && char.traits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {char.traits.map((trait, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
