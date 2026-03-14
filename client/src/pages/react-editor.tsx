import { Database, Code2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/code-editor";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ReactEditorPage() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between gap-4 px-4 h-14 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            <Link href="/">
              <Button 
                variant={location === "/" ? "secondary" : "ghost"} 
                size="sm"
                className="gap-2"
                data-testid="nav-sql-editor"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">SQL</span>
              </Button>
            </Link>
            <Link href="/react">
              <Button 
                variant={location === "/react" ? "secondary" : "ghost"} 
                size="sm"
                className="gap-2"
                data-testid="nav-react-editor"
              >
                <Code2 className="h-4 w-4" />
                <span className="hidden sm:inline">React</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <ThemeToggle />
      </header>
      
      <main className="flex-1 overflow-hidden">
        <CodeEditor />
      </main>
    </div>
  );
}
