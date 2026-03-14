import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { FileText, ArrowLeft, Calendar, Building2, Gamepad2, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const postTypeColors: Record<string, string> = {
  devlog: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  patch_notes: "bg-green-500/10 text-green-600 dark:text-green-400",
  announcement: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  apology: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  cancellation: "bg-red-500/10 text-red-600 dark:text-red-400",
  postmortem: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

const postTypeFlavor: Record<string, string> = {
  devlog: "Promises that may or may not be kept",
  patch_notes: "Things that probably broke other things",
  announcement: "Get your wallets ready",
  apology: "We're sorry you feel that way",
  cancellation: "We're going dark for a while",
  postmortem: "Lessons we definitely won't learn from",
};

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

function renderMarkdown(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br/>');
  
  return `<p class="mb-4">${html}</p>`;
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading, error } = useQuery<any>({
    queryKey: [`/api/posts/${id}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-16 mb-6" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Post Scrubbed From Reality</h2>
            <p className="text-muted-foreground mb-4">This post was either deleted after community backlash or the intern accidentally pushed to production.</p>
            <Link href="/posts">
              <Button>Return to the Drama</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/posts">
          <Button variant="ghost" size="sm" className="gap-2 mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>
        </Link>

        {/* Post type badge */}
        {post.type && (
          <div className="mb-4">
            <Badge className={`${postTypeColors[post.type] || ""}`} data-testid="badge-post-type">
              {formatStatus(post.type)}
            </Badge>
            {postTypeFlavor[post.type] && (
              <p className="text-xs text-muted-foreground/70 italic mt-1">
                {postTypeFlavor[post.type]}
              </p>
            )}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-post-title">
          {post.title}
        </h1>

        {/* Version badge for patch notes */}
        {post.version && (
          <Badge variant="outline" className="font-mono mb-4" data-testid="badge-version">
            v{post.version}
          </Badge>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
          {post.studio_name && (
            <Link href={`/studios/${post.studio_slug}`}>
              <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer" data-testid="link-studio">
                <Building2 className="h-4 w-4" />
                {post.studio_name}
              </span>
            </Link>
          )}
          {post.game_title && (
            <Link href={`/studios/${post.studio_slug}/games/${post.game_slug}`}>
              <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer" data-testid="link-game">
                <Gamepad2 className="h-4 w-4" />
                {post.game_title}
              </span>
            </Link>
          )}
          {post.created_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.created_at)}
            </span>
          )}
        </div>

        <Separator className="mb-8" />

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            {post.body_md ? (
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none font-mono text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body_md) }}
                data-testid="content-body"
              />
            ) : (
              <p className="text-muted-foreground italic">No content. The writer either rage-quit or is still recovering from the last crunch.</p>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <>
            <Separator className="mb-6" />
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: any) => (
                <Badge 
                  key={tag.id} 
                  variant="secondary" 
                  className="gap-1"
                  data-testid={`tag-${tag.id}`}
                >
                  <Hash className="h-3 w-3" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
