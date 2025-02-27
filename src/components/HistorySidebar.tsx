import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search, Clock, ChevronRight, Globe } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";

type CompetitorAnalysis = Tables<"competitor_analyses">;

interface HistorySidebarProps {
  analyses: CompetitorAnalysis[];
  onItemClick: (analysis: CompetitorAnalysis) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  analyses, 
  onItemClick, 
  isCollapsed,
  onToggle
}) => {
  const getSearchEngineBadge = (engine: string) => {
    if (engine === 'google') {
      return <Badge variant="default" className="bg-blue-500">Google</Badge>;
    }
    return <Badge variant="outline">DuckDuckGo</Badge>;
  };

  if (isCollapsed) {
    return (
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-10">
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-24 rounded-l-none shadow-md"
          onClick={onToggle}
        >
          <ChevronRight className="w-4 h-4" />
          <span className="rotate-90 ml-1">History</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-0 h-full bg-card border-r shadow-lg z-10 transition-all duration-300 w-72">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <h3 className="font-medium">Analysis History</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggle}
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-64px)] w-full p-4">
        <div className="space-y-2">
          {analyses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No previous analyses found
            </p>
          ) : (
            analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex flex-col p-3 hover:bg-accent rounded-md transition-colors cursor-pointer"
                onClick={() => onItemClick(analysis)}
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <p className="font-medium truncate">{analysis.keyword}</p>
                </div>
                <div className="flex items-center justify-between mt-1 pl-6">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(analysis.created_at), 'MMM d, yyyy HH:mm')}
                  </p>
                  {getSearchEngineBadge(analysis.search_engine)}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}; 