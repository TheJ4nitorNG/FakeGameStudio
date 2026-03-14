import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Loader2, Copy, Download, Trash2, Clock, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { SqlExecuteResult } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface QueryHistoryItem {
  query: string;
  timestamp: Date;
  success: boolean;
  rowCount?: number;
  executionTime?: number;
}

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "LIKE", "BETWEEN",
  "ORDER", "BY", "ASC", "DESC", "LIMIT", "OFFSET", "GROUP", "HAVING",
  "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "FULL", "CROSS", "ON",
  "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE",
  "ALTER", "DROP", "INDEX", "VIEW", "AS", "DISTINCT", "COUNT", "SUM", "AVG",
  "MIN", "MAX", "CASE", "WHEN", "THEN", "ELSE", "END", "NULL", "IS", "TRUE",
  "FALSE", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "UNIQUE", "DEFAULT",
  "CHECK", "CONSTRAINT", "CASCADE", "TRUNCATE", "WITH", "RETURNING", "COALESCE",
  "CAST", "EXISTS", "UNION", "ALL", "INTERSECT", "EXCEPT", "RECURSIVE"
];

function highlightSQL(query: string): string {
  let highlighted = query;
  
  // Escape HTML
  highlighted = highlighted
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Highlight strings
  highlighted = highlighted.replace(/'([^']*)'/g, "<span class='sql-string'>'$1'</span>");
  
  // Highlight numbers
  highlighted = highlighted.replace(/\b(\d+)\b/g, "<span class='sql-number'>$1</span>");
  
  // Highlight keywords (case insensitive)
  for (const keyword of SQL_KEYWORDS) {
    const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
    highlighted = highlighted.replace(regex, "<span class='sql-keyword'>$1</span>");
  }
  
  // Highlight comments
  highlighted = highlighted.replace(/(--.*$)/gm, "<span class='sql-comment'>$1</span>");
  
  return highlighted;
}

interface SqlEditorProps {
  initialQuery?: string;
}

export function SqlEditor({ initialQuery }: SqlEditorProps) {
  const [query, setQuery] = useState(initialQuery || "SELECT * FROM studios LIMIT 10;");
  
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);
  const [result, setResult] = useState<SqlExecuteResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const executeQuery = useCallback(async () => {
    if (!query.trim() || isExecuting) return;
    
    setIsExecuting(true);
    setResult(null);
    
    try {
      const response = await apiRequest("POST", "/api/sql/execute", { query: query.trim() });
      const data = await response.json() as SqlExecuteResult;
      
      setResult(data);
      
      setHistory(prev => [{
        query: query.trim(),
        timestamp: new Date(),
        success: data.success,
        rowCount: data.rowCount,
        executionTime: data.executionTime,
      }, ...prev.slice(0, 49)]);
      
      if (data.success) {
        toast({
          title: "Query executed",
          description: `${data.rowCount ?? 0} row${(data.rowCount ?? 0) !== 1 ? "s" : ""} returned in ${data.executionTime}ms`,
        });
      }
    } catch (error: any) {
      const errorResult: SqlExecuteResult = {
        success: false,
        error: error.message || "Failed to execute query",
      };
      setResult(errorResult);
      
      setHistory(prev => [{
        query: query.trim(),
        timestamp: new Date(),
        success: false,
      }, ...prev.slice(0, 49)]);
    } finally {
      setIsExecuting(false);
    }
  }, [query, isExecuting, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      executeQuery();
    }
    
    // Tab inserts spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = query.substring(0, start) + "  " + query.substring(end);
        setQuery(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  const copyToClipboard = async () => {
    if (result?.rows) {
      const csv = [
        result.columns?.join(",") || "",
        ...result.rows.map(row => 
          (result.columns || []).map(col => {
            const val = row[col];
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str.includes(",") || str.includes('"') || str.includes("\n") 
              ? `"${str.replace(/"/g, '""')}"` 
              : str;
          }).join(",")
        )
      ].join("\n");
      
      await navigator.clipboard.writeText(csv);
      toast({ title: "Copied to clipboard" });
    }
  };

  const downloadCSV = () => {
    if (result?.rows && result.columns) {
      const csv = [
        result.columns.join(","),
        ...result.rows.map(row => 
          result.columns!.map(col => {
            const val = row[col];
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str.includes(",") || str.includes('"') || str.includes("\n") 
              ? `"${str.replace(/"/g, '""')}"` 
              : str;
          }).join(",")
        )
      ].join("\n");
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `query-result-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const loadFromHistory = (item: QueryHistoryItem) => {
    setQuery(item.query);
  };

  const clearHistory = () => {
    setHistory([]);
    toast({ title: "History cleared" });
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Query Input */}
      <Card className="flex flex-col">
        <div className="flex items-center justify-between gap-4 p-3 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              SQL
            </Badge>
            <span className="text-sm text-muted-foreground">
              Press Ctrl+Enter to execute
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={executeQuery}
              disabled={isExecuting || !query.trim()}
              data-testid="button-execute-query"
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="ml-2">Run</span>
            </Button>
          </div>
        </div>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your SQL query here..."
            className="w-full min-h-[160px] p-4 font-mono text-sm bg-transparent resize-y focus:outline-none"
            spellCheck={false}
            data-testid="input-sql-query"
          />
        </div>
      </Card>

      {/* Results */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between gap-4 p-3 border-b flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Results</span>
            {result && (
              <>
                {result.success ? (
                  <Badge variant="secondary" className="gap-1">
                    <Check className="h-3 w-3" />
                    {result.rowCount ?? 0} rows
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Error
                  </Badge>
                )}
                {result.executionTime !== undefined && (
                  <Badge variant="outline" className="gap-1 font-mono text-xs">
                    <Clock className="h-3 w-3" />
                    {result.executionTime}ms
                  </Badge>
                )}
              </>
            )}
          </div>
          {result?.success && result.rows && result.rows.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copyToClipboard} data-testid="button-copy-results">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadCSV} data-testid="button-download-csv">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <ScrollArea className="flex-1">
          {!result && (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Run a query to see results
            </div>
          )}
          
          {result && !result.success && (
            <div className="p-4">
              <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-mono text-destructive">{result.error}</p>
              </div>
            </div>
          )}
          
          {result?.success && result.rows && result.rows.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Query returned no results
            </div>
          )}
          
          {result?.success && result.rows && result.rows.length > 0 && result.columns && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    {result.columns.map((col, i) => (
                      <th 
                        key={i} 
                        className="px-4 py-2 text-left font-medium text-muted-foreground border-b whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {result.rows.map((row, rowIndex) => (
                    <tr 
                      key={rowIndex} 
                      className="border-b hover-elevate"
                      data-testid={`row-result-${rowIndex}`}
                    >
                      {result.columns!.map((col, colIndex) => (
                        <td 
                          key={colIndex} 
                          className="px-4 py-2 whitespace-nowrap max-w-xs truncate"
                          title={String(row[col] ?? "")}
                        >
                          {row[col] === null ? (
                            <span className="text-muted-foreground italic">null</span>
                          ) : typeof row[col] === "boolean" ? (
                            <Badge variant={row[col] ? "default" : "secondary"} className="text-xs">
                              {String(row[col])}
                            </Badge>
                          ) : (
                            String(row[col])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Query History */}
      {history.length > 0 && (
        <Card className="flex-shrink-0">
          <div className="flex items-center justify-between gap-4 p-3 border-b">
            <span className="text-sm font-medium">Recent Queries</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearHistory}
              data-testid="button-clear-history"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="max-h-40">
            <div className="p-2 space-y-1">
              {history.slice(0, 10).map((item, i) => (
                <button
                  key={i}
                  onClick={() => loadFromHistory(item)}
                  className="w-full text-left p-2 rounded-md hover-elevate flex items-center gap-2"
                  data-testid={`button-history-${i}`}
                >
                  {item.success ? (
                    <Check className="h-3 w-3 text-chart-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                  )}
                  <span className="font-mono text-xs truncate flex-1">
                    {item.query}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
