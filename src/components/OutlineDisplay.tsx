
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OutlineDisplayProps {
  outline: {
    outline: string;
    searchResults: any[];
  };
  onExport: () => void;
}

export const OutlineDisplay: React.FC<OutlineDisplayProps> = ({ outline, onExport }) => {
  return (
    <Card className="p-6 glass animate-fade-up">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Master Outline</h3>
          <Button onClick={onExport} variant="outline" size="sm">
            Export
          </Button>
        </div>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="whitespace-pre-wrap">{outline.outline}</div>
        </ScrollArea>
      </div>
    </Card>
  );
};
