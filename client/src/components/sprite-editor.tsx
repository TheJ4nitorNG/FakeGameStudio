import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Eraser, Pencil, Trash2, Download, Undo, Redo, Grid3X3, Paintbrush } from "lucide-react";
import { StepIntro, useStepIntro } from "@/components/step-intro";
import { AnimatePresence } from "framer-motion";

const DEFAULT_PALETTE = [
  "#000000", "#1D2B53", "#7E2553", "#008751",
  "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8",
  "#FF004D", "#FFA300", "#FFEC27", "#00E436",
  "#29ADFF", "#83769C", "#FF77A8", "#FFCCAA",
];

interface SpriteEditorProps {
  width?: number;
  height?: number;
  initialData?: string;
  onSave?: (data: { pixelData: string; palette: string[] }) => void;
  spriteName?: string;
}

export function SpriteEditor({
  width = 16,
  height = 16,
  initialData,
  onSave,
  spriteName = "Untitled Sprite",
}: SpriteEditorProps) {
  const { showIntro, dismissIntro } = useStepIntro("sprite-lab-intro");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<string[][]>(() => {
    if (initialData) {
      try {
        return JSON.parse(initialData);
      } catch {
        return Array(height).fill(null).map(() => Array(width).fill(""));
      }
    }
    return Array(height).fill(null).map(() => Array(width).fill(""));
  });
  
  const [currentColor, setCurrentColor] = useState(DEFAULT_PALETTE[0]);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  const [zoom, setZoom] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<string[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [name, setName] = useState(spriteName);

  const pixelSize = zoom;
  const canvasWidth = width * pixelSize;
  const canvasHeight = height * pixelSize;

  const saveToHistory = useCallback((newPixels: string[][]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newPixels)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPixels(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPixels(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [history, historyIndex]);

  const drawPixel = useCallback((x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    
    const newPixels = pixels.map(row => [...row]);
    newPixels[y][x] = tool === "eraser" ? "" : currentColor;
    setPixels(newPixels);
  }, [pixels, currentColor, tool, width, height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    saveToHistory(pixels);
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    drawPixel(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    drawPixel(x, y);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    saveToHistory(pixels);
    setPixels(Array(height).fill(null).map(() => Array(width).fill("")));
  };

  const exportAsPNG = () => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    pixels.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      });
    });

    const link = document.createElement("a");
    link.download = `${name.replace(/\s+/g, "_").toLowerCase()}.png`;
    link.href = exportCanvas.toDataURL();
    link.click();
  };

  const handleSave = () => {
    onSave?.({
      pixelData: JSON.stringify(pixels),
      palette: DEFAULT_PALETTE,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    pixels.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      });
    });

    if (showGrid) {
      ctx.strokeStyle = "rgba(128, 128, 128, 0.3)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * pixelSize, 0);
        ctx.lineTo(x * pixelSize, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * pixelSize);
        ctx.lineTo(canvasWidth, y * pixelSize);
        ctx.stroke();
      }
    }
  }, [pixels, pixelSize, showGrid, canvasWidth, canvasHeight, width, height]);

  if (showIntro) {
    return (
      <AnimatePresence>
        <StepIntro
          icon={Paintbrush}
          title="Welcome to Sprite Lab"
          tagline="Where pixels go to become art (allegedly)"
          description={[
            "So you want to make game art? Bold. Brave. Probably misguided. But here we are.",
            "Real game developers spend years mastering pixel art. You have approximately 5 minutes and a 16x16 canvas. The odds are not in your favor, but constraints breed creativity... or frustration. Usually both.",
            "Every legendary game started with someone staring at an empty canvas, just like you. Undertale, Celeste, Shovel Knight - all pixel art. All made by people who clicked one pixel at a time. You've got this. Probably."
          ]}
          tips={[
            "Click and drag on the canvas to place pixels. Revolutionary, we know.",
            "Pick colors from the palette on the right. The PICO-8 palette is classic for a reason.",
            "Use the eraser to fix mistakes. You'll need it. Everyone does.",
            "Hit 'Save & Continue' when you've created something you're not completely embarrassed by."
          ]}
          buttonText="Time to Make Some Art"
          onContinue={dismissIntro}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="flex-1">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-xl">Sprite Lab</CardTitle>
            <p className="text-xs text-muted-foreground italic">
              "Just add more pixels until it looks intentional"
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="sprite-name" className="text-sm text-muted-foreground">
              Sprite Name (choose wisely, you'll regret it later)
            </Label>
            <Input
              id="sprite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="player_walk_01_final_FINAL_v2"
              className="mt-1"
              data-testid="input-sprite-name"
            />
          </div>

          <div 
            className="relative overflow-auto border rounded-lg bg-[repeating-conic-gradient(#e5e7eb_0_90deg,#fff_90deg_180deg)_0_0/16px_16px] dark:bg-[repeating-conic-gradient(#374151_0_90deg,#1f2937_90deg_180deg)_0_0/16px_16px] p-4"
            style={{ maxHeight: "500px" }}
          >
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="cursor-crosshair mx-auto block"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ imageRendering: "pixelated" }}
              data-testid="canvas-sprite"
            />
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Label className="text-sm text-muted-foreground">Zoom:</Label>
            <Slider
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              min={10}
              max={40}
              step={2}
              className="w-32"
              data-testid="slider-zoom"
            />
            <span className="text-sm">{zoom}x</span>
          </div>
        </CardContent>
      </Card>

      <div className="w-full lg:w-64 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tools</CardTitle>
            <p className="text-xs text-muted-foreground">Professional artist equipment</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant={tool === "pencil" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setTool("pencil")}
                data-testid="button-tool-pencil"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === "eraser" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setTool("eraser")}
                data-testid="button-tool-eraser"
              >
                <Eraser className="h-4 w-4" />
              </Button>
              <Button
                variant={showGrid ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setShowGrid(!showGrid)}
                data-testid="button-toggle-grid"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={historyIndex <= 0}
                data-testid="button-undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                data-testid="button-redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearCanvas}
                data-testid="button-clear"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Color Palette</CardTitle>
            <p className="text-xs text-muted-foreground">PICO-8 approved colors</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-1">
              {DEFAULT_PALETTE.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                    currentColor === color ? "border-primary ring-2 ring-primary/50" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                  data-testid={`button-color-${color.replace("#", "")}`}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: currentColor }}
              />
              <Input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="w-12 h-8 p-0 border-0"
                data-testid="input-color-picker"
              />
              <span className="text-xs font-mono">{currentColor}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Actions</CardTitle>
            <p className="text-xs text-muted-foreground">Moment of truth</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={exportAsPNG}
              data-testid="button-export-png"
            >
              <Download className="h-4 w-4" />
              Export PNG
            </Button>
            <Button
              className="w-full"
              onClick={handleSave}
              data-testid="button-save-sprite"
            >
              Save Sprite & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
