
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Search, Clock } from "lucide-react";

interface HistoryDisplayProps {
  analyses: Array<{
    id: string;
    keyword: string;
    search_engine: string;
    created_at: string;
  }>;
  onItemClick: (analysis: any) => void;
}

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ analyses, onItemClick }) => {
  return (
    <Card className="p-6 mt-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <h3 className="text-lg font-medium">Recent Analyses</h3>
        </div>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-2 hover:bg-accent rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{analysis.keyword}</p>
                    <p className="text-sm text-muted-foreground">
                      {analysis.search_engine} • {format(new Date(analysis.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onItemClick(analysis)}
                >
                  Load
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
