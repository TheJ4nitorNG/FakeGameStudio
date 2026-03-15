import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import Home from "@/pages/home";
import ReactEditorPage from "@/pages/react-editor";
import FeedPage from "@/pages/feed";
import StudioPage from "@/pages/studio";
import GamePage from "@/pages/game";
import PostPage from "@/pages/post";
import DashboardPage from "@/pages/dashboard";
import CreatePage from "@/pages/create";
import ProjectPage from "@/pages/project";
import NotFound from "@/pages/not-found";
// 1. Import the new page 
import CreatePost from "@/pages/create-post"; 

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/create" component={CreatePage} />
      <Route path="/create/:id" component={CreatePage} />
      <Route path="/project/:id" component={ProjectPage} />
      <Route path="/sql" component={Home} />
      <Route path="/react" component={ReactEditorPage} />
      <Route path="/posts" component={FeedPage} />
      
      {/* 2. put the 'new' route in above the ':id' route */}
      <Route path="/posts/new" component={CreatePost} />
      <Route path="/posts/:id" component={PostPage} />
      
      <Route path="/studios/:slug" component={StudioPage} />
      <Route path="/studios/:studioSlug/games/:gameSlug" component={GamePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
