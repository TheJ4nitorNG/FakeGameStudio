import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function CreatePost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    type: "devlog",
    studio_name: "",
    game_title: "",
    version: "",
    body_md: "",
  });

  const mutation = useMutation({
    mutationFn: async (newPost: typeof formData) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      
      if (!res.ok) {
        throw new Error("Failed to publish your drama");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Published!", 
        description: "Your statement has been released to the angry mobs." 
      });
      setLocation("/posts"); // Send them back to the feed after posting
    },
    onError: (err: any) => {
      toast({ 
        title: "Failed to post", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const inputClasses = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/posts">
          <Button variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Cancel & Retreat
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Draft Public Statement</CardTitle>
            <CardDescription>
              Time to face the music. What are you announcing to your players today?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Post Title</label>
                <input 
                  required
                  className={inputClasses}
                  placeholder="e.g., We messed up (Again)"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statement Type</label>
                  <select 
                    className={inputClasses}
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="all">All The Drama</option>
                    <option value="devlog">Devlog (Lies)</option>
                    <option value="patch_notes">Patch Notes</option>
                    <option value="announcement">Hype Trains</option>
                    <option value="apology">Public Apologies</option>
                    <option value="cancellation">RIP Projects</option>
                    <option value="postmortem">Postmortem</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Patch Version (Optional)</label>
                  <input 
                    className={inputClasses}
                    placeholder="e.g., 1.0.4b"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Studio Name (Optional)</label>
                  <input 
                    className={inputClasses}
                    placeholder="Fake Game Studio Inc."
                    value={formData.studio_name}
                    onChange={(e) => setFormData({...formData, studio_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Game Title (Optional)</label>
                  <input 
                    className={inputClasses}
                    placeholder="Cyberpunk 2078"
                    value={formData.game_title}
                    onChange={(e) => setFormData({...formData, game_title: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">The Statement (Markdown Supported)</label>
                <textarea 
                  required
                  className={`${inputClasses} min-h-[200px] py-3 resize-y`}
                  placeholder="Write your excuses here... Use **bold** or *italics* if you really mean it."
                  value={formData.body_md}
                  onChange={(e) => setFormData({...formData, body_md: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={mutation.isPending}>
                <Send className="h-4 w-4" />
                {mutation.isPending ? "Publishing..." : "Publish to the World"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
