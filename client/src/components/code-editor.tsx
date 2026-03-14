import { useState, useCallback, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { Play, RotateCcw, Copy, Download, Maximize2, Minimize2, FileCode, FileText, Palette, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme";

const DEFAULT_JS = `function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>
        Hello, Fake Game Studio!
      </h1>
      <p style={{ marginBottom: '1rem' }}>
        Build your imaginary games here.
      </p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          backgroundColor: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}
      >
        Fake Downloads: {count}
      </button>
    </div>
  );
}

render(<App />);`;

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body {
      margin: 0;
      padding: 1rem;
      font-family: system-ui, sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

const DEFAULT_CSS = `/* Custom styles for your components */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.button-primary {
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.button-primary:hover {
  opacity: 0.9;
}`;

interface ConsoleMessage {
  type: "log" | "error" | "warn" | "info";
  content: string;
  timestamp: Date;
}

export function CodeEditor() {
  const [jsCode, setJsCode] = useState(DEFAULT_JS);
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML);
  const [cssCode, setCssCode] = useState(DEFAULT_CSS);
  const [activeTab, setActiveTab] = useState("js");
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  const runCode = useCallback(() => {
    setConsoleMessages([]);
    
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) return;

    const wrappedCode = `
      <html>
        <head>
          <style>${cssCode}</style>
          <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
          <style>
            body { margin: 0; font-family: system-ui, sans-serif; }
            #root { min-height: 100vh; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            const originalConsoleLog = console.log;
            const originalConsoleError = console.error;
            const originalConsoleWarn = console.warn;
            const originalConsoleInfo = console.info;
            
            function sendToParent(type, args) {
              try {
                const content = Array.from(args).map(arg => {
                  if (typeof arg === 'object') {
                    return JSON.stringify(arg, null, 2);
                  }
                  return String(arg);
                }).join(' ');
                window.parent.postMessage({ type: 'console', logType: type, content }, '*');
              } catch (e) {}
            }
            
            console.log = function(...args) {
              originalConsoleLog.apply(console, args);
              sendToParent('log', args);
            };
            console.error = function(...args) {
              originalConsoleError.apply(console, args);
              sendToParent('error', args);
            };
            console.warn = function(...args) {
              originalConsoleWarn.apply(console, args);
              sendToParent('warn', args);
            };
            console.info = function(...args) {
              originalConsoleInfo.apply(console, args);
              sendToParent('info', args);
            };
            
            window.onerror = function(msg, url, line, col, error) {
              sendToParent('error', [msg + ' (line ' + line + ')']);
            };
          <\/script>
          <script type="text/babel">
            const render = (component) => {
              ReactDOM.createRoot(document.getElementById('root')).render(component);
            };
            
            try {
              ${jsCode}
            } catch (error) {
              console.error('Runtime Error:', error.message);
            }
          <\/script>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(wrappedCode);
    iframeDoc.close();
  }, [jsCode, cssCode]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "console") {
        setConsoleMessages(prev => [...prev, {
          type: event.data.logType,
          content: event.data.content,
          timestamp: new Date(),
        }]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (autoRun) {
      const timer = setTimeout(runCode, 500);
      return () => clearTimeout(timer);
    }
  }, [jsCode, cssCode, autoRun, runCode]);

  const resetCode = () => {
    setJsCode(DEFAULT_JS);
    setHtmlCode(DEFAULT_HTML);
    setCssCode(DEFAULT_CSS);
    setConsoleMessages([]);
    toast({ title: "Code reset to default" });
  };

  const copyCode = async () => {
    const code = activeTab === "js" ? jsCode : activeTab === "html" ? htmlCode : cssCode;
    await navigator.clipboard.writeText(code);
    toast({ title: "Copied to clipboard" });
  };

  const downloadCode = () => {
    const code = activeTab === "js" ? jsCode : activeTab === "html" ? htmlCode : cssCode;
    const ext = activeTab === "js" ? "jsx" : activeTab;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `component.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLanguageExtension = () => {
    switch (activeTab) {
      case "js": return javascript({ jsx: true, typescript: false });
      case "html": return html();
      case "css": return css();
      default: return javascript({ jsx: true });
    }
  };

  const getCurrentCode = () => {
    switch (activeTab) {
      case "js": return jsCode;
      case "html": return htmlCode;
      case "css": return cssCode;
      default: return jsCode;
    }
  };

  const setCurrentCode = (value: string) => {
    switch (activeTab) {
      case "js": setJsCode(value); break;
      case "html": setHtmlCode(value); break;
      case "css": setCssCode(value); break;
    }
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-3 border-b flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-mono text-xs">
            React Editor
          </Badge>
          <Button
            variant={autoRun ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setAutoRun(!autoRun)}
            data-testid="button-auto-run"
          >
            {autoRun ? "Auto-Run: On" : "Auto-Run: Off"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={copyCode} data-testid="button-copy-code">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={downloadCode} data-testid="button-download-code">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={resetCode} data-testid="button-reset-code">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} data-testid="button-fullscreen">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button onClick={runCode} data-testid="button-run-code">
            <Play className="h-4 w-4" />
            <span className="ml-2">Run</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col min-w-0 border-r">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="js" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 gap-2"
                data-testid="tab-js"
              >
                <FileCode className="h-4 w-4" />
                App.jsx
              </TabsTrigger>
              <TabsTrigger 
                value="css" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 gap-2"
                data-testid="tab-css"
              >
                <Palette className="h-4 w-4" />
                styles.css
              </TabsTrigger>
              <TabsTrigger 
                value="html" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 gap-2"
                data-testid="tab-html"
              >
                <FileText className="h-4 w-4" />
                index.html
              </TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="flex-1 m-0 overflow-hidden">
              <CodeMirror
                value={getCurrentCode()}
                height="100%"
                extensions={[getLanguageExtension()]}
                onChange={setCurrentCode}
                theme={theme === "dark" ? "dark" : "light"}
                className="h-full text-sm"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  foldGutter: true,
                  drawSelection: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  syntaxHighlighting: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  rectangularSelection: true,
                  crosshairCursor: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: true,
                  defaultKeymap: true,
                  searchKeymap: true,
                  historyKeymap: true,
                  foldKeymap: true,
                  completionKeymap: true,
                  lintKeymap: true,
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
            <span className="text-sm font-medium">Preview</span>
          </div>
          <div className="flex-1 bg-white dark:bg-gray-900">
            <iframe
              ref={iframeRef}
              title="Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              data-testid="preview-iframe"
            />
          </div>
          
          {/* Console */}
          <div className="h-40 border-t flex flex-col">
            <div className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-muted/30">
              <span className="text-sm font-medium">Console</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setConsoleMessages([])}
                data-testid="button-clear-console"
              >
                Clear
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 font-mono text-xs space-y-1">
                {consoleMessages.length === 0 && (
                  <div className="text-muted-foreground p-2">Console output will appear here...</div>
                )}
                {consoleMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex items-start gap-2 p-1 rounded ${
                      msg.type === "error" ? "bg-destructive/10 text-destructive" :
                      msg.type === "warn" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                      msg.type === "info" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                      ""
                    }`}
                    data-testid={`console-message-${i}`}
                  >
                    {msg.type === "error" ? <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" /> :
                     msg.type === "log" ? <Check className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" /> : null}
                    <span className="break-all">{msg.content}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
