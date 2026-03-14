import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, Table2, Key, Hash, Type, ToggleLeft, Calendar, Loader2, RefreshCw, Database, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TableSchema } from "@shared/schema";

interface SchemaResponse {
  tables: TableSchema[];
}

function getTypeIcon(type: string) {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("int") || lowerType.includes("numeric") || lowerType.includes("decimal")) {
    return <Hash className="h-3 w-3 text-chart-4" />;
  }
  if (lowerType.includes("bool")) {
    return <ToggleLeft className="h-3 w-3 text-chart-2" />;
  }
  if (lowerType.includes("timestamp") || lowerType.includes("date") || lowerType.includes("time")) {
    return <Calendar className="h-3 w-3 text-chart-3" />;
  }
  return <Type className="h-3 w-3 text-muted-foreground" />;
}

function TableItem({ table, onSelectTable }: { table: TableSchema; onSelectTable: (tableName: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="mb-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-2 rounded-md hover-elevate text-left"
        data-testid={`button-table-${table.tableName}`}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <Table2 className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="font-medium text-sm truncate flex-1">{table.tableName}</span>
        <Badge variant="outline" className="text-xs font-mono">
          {table.columns.length}
        </Badge>
      </button>
      
      {isExpanded && (
        <div className="ml-6 pl-2 border-l space-y-0.5">
          {table.columns.map((col, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div 
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover-elevate cursor-default"
                  data-testid={`column-${table.tableName}-${col.name}`}
                >
                  {col.isPrimaryKey ? (
                    <Key className="h-3 w-3 text-chart-4 flex-shrink-0" />
                  ) : (
                    getTypeIcon(col.type)
                  )}
                  <span className={`truncate flex-1 ${col.isPrimaryKey ? "font-medium" : ""}`}>
                    {col.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                    {col.type}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-xs space-y-1">
                  <div><span className="text-muted-foreground">Column:</span> {col.name}</div>
                  <div><span className="text-muted-foreground">Type:</span> {col.type}</div>
                  <div><span className="text-muted-foreground">Nullable:</span> {col.nullable ? "Yes" : "No"}</div>
                  {col.isPrimaryKey && <Badge className="text-xs">Primary Key</Badge>}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-1 text-xs"
            onClick={() => onSelectTable(table.tableName)}
            data-testid={`button-select-${table.tableName}`}
          >
            SELECT * FROM {table.tableName}
          </Button>
        </div>
      )}
    </div>
  );
}

interface SchemaBrowserProps {
  onSelectQuery: (query: string) => void;
}

export function SchemaBrowser({ onSelectQuery }: SchemaBrowserProps) {
  const { data, isLoading, error, refetch } = useQuery<SchemaResponse>({
    queryKey: ["/api/sql/schema"],
  });

  const handleSelectTable = (tableName: string) => {
    onSelectQuery(`SELECT * FROM ${tableName} LIMIT 100;`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 p-3 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Schema</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
          data-testid="button-refresh-schema"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {error && (
            <div className="p-4 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Failed to load schema</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                Retry
              </Button>
            </div>
          )}
          
          {data?.tables && data.tables.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No tables found
            </div>
          )}
          
          {data?.tables && data.tables.map((table, i) => (
            <TableItem 
              key={i} 
              table={table} 
              onSelectTable={handleSelectTable}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
