import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Database, Wifi, WifiOff, Terminal, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SqlEditor } from "@/components/sql-editor";
import { SchemaBrowser } from "@/components/schema-browser";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Home() {
  const [currentQuery, setCurrentQuery] = useState("");
  
  const { data: connectionStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/sql/test"],
    refetchInterval: 30000,
  });

  const handleSelectQuery = useCallback((query: string) => {
    setCurrentQuery(query);
  }, []);

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                <Terminal className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">SQL Editor</span>
                <span className="text-xs text-muted-foreground">Supabase</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SchemaBrowser onSelectQuery={handleSelectQuery} />
          </SidebarContent>
        </Sidebar>
        
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 px-4 h-14 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="gap-2"
                  data-testid="nav-sql-editor"
                >
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">SQL</span>
                </Button>
                <Link href="/react">
                  <Button 
                    variant="ghost" 
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
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={connectionStatus?.connected ? "secondary" : "destructive"}
                className="gap-1"
              >
                {connectionStatus?.connected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span className="hidden sm:inline">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span className="hidden sm:inline">Disconnected</span>
                  </>
                )}
              </Badge>
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 overflow-hidden">
            <SqlEditor initialQuery={currentQuery} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
