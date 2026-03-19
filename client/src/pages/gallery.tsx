import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Paintbrush, Users, ImageIcon, ArrowLeft, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { Sprite, Character } from "@shared/schema";

// Custom type since we join the project title in the SQL query
type SpriteWithProject = Sprite & { project_title: string };
type CharacterWithProject = Character & { project_title: string };

// The magic thumbnail generator (Now Bulletproof!)
function SpriteThumbnail({ pixelData, width = 16, height = 16, scale = 4 }: { pixelData: string | any, width?: number, height?: number, scale?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !pixelData) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    try {
      // 1. Handle weird database stringification issues safely
      let pixels = pixelData;
      if (typeof pixels === "string") {
        pixels = JSON.parse(pixels);
      }
      if (typeof pixels === "string") {
        pixels = JSON.parse(pixels); // Catch double-stringification!
      }

      // 2. Ensure dimensions are treated as numbers (sometimes Postgres returns strings)
      const numWidth = Number(width);
      const numHeight = Number(height);
      
      ctx.clearRect(0, 0, numWidth * scale, numHeight * scale);
      
      if (!Array.isArray(pixels)) {
        console.error("Sprite data is not a valid array!", pixels);
        return;
      }

      // 3. Draw the pixels
      let drawnPixels = 0;
      pixels.forEach((row: string[], y: number) => {
        row.forEach((color: string, x: number) => {
          if (color && typeof color === "string" && color.trim() !== "") {
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
            drawnPixels++;
          }
        });
      });

      // Failsafe warning in the console if the canvas is literally blank
      if (drawnPixels === 0) {
        console.warn("Warning: This sprite has zero colored pixels!");
      }

    } catch (e) {
      console.error("Failed to parse and draw sprite data", e);
    }
  }, [pixelData, width, height, scale]);

  return (
    <canvas 
      ref={canvasRef} 
      width={Number(width) * scale} 
      height={Number(height) * scale} 
      className="mx-auto block bg-[repeating-conic-gradient(#e5e7eb_0_90deg,#fff_90deg_180deg)_0_0/8px_8px] dark:bg-[repeating-conic-gradient(#374151_0_90deg,#1f2937_90deg_180deg)_0_0/8px_8px] rounded shadow-sm"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export default function AssetGallery() {
  const [selectedSprite, setSelectedSprite] = useState<SpriteWithProject | null>(null);

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
      {/* Banner */}
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
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg bg-card border-4 border-background flex items-center justify-center overflow-hidden shadow-lg">
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
                  <Card 
                    key={sprite.id} 
                    className="overflow-hidden group hover:border-primary transition-colors cursor-pointer"
                    onClick={() => setSelectedSprite(sprite)}
                  >
                    <CardContent className="p-4 bg-muted/30 flex items-center justify-center min-h-[120px]">
                      <div className="group-hover:scale-110 transition-transform">
                        <SpriteThumbnail pixelData={sprite.pixelData} width={sprite.width} height={sprite.height} scale={4} />
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

      {/* THE SPRITE LIGHTBOX */}
      {selectedSprite && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => setSelectedSprite(null)}
        >
          <div 
            className="relative bg-card p-6 md:p-8 rounded-2xl max-w-lg w-full flex flex-col items-center gap-6 shadow-2xl border border-primary/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSprite(null)}
              className="absolute top-4 right-4 p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center w-full pr-8">
              <h2 className="text-2xl font-bold truncate">{selectedSprite.name}</h2>
              <p className="text-muted-foreground mt-1 truncate">From: {selectedSprite.project_title}</p>
            </div>

            <div className="bg-muted p-8 rounded-xl border shadow-inner overflow-hidden flex items-center justify-center min-w-[256px] min-h-[256px]">
              {/* Massive scale for the Lightbox */}
              <SpriteThumbnail 
                pixelData={selectedSprite.pixelData} 
                width={selectedSprite.width} 
                height={selectedSprite.height} 
                scale={16} 
              />
            </div>
            
            <div className="flex gap-4 text-sm text-muted-foreground font-mono">
              <Badge variant="outline">{selectedSprite.width}x{selectedSprite.height} px</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
