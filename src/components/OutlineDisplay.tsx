
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OutlineDisplayProps {
  outline: {
    outline: string;
    searchResults: Array<{
      title: string;
      snippet: string;
      link: string;
      position?: number;
    }>;
  };
  onExport: () => void;
}

export const OutlineDisplay: React.FC<OutlineDisplayProps> = ({ outline, onExport }) => {
  return (
    <Card className="p-6 glass animate-fade-up">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Content Analysis</h3>
          <Button onClick={onExport} variant="outline" size="sm">
            Export
          </Button>
        </div>

        <Tabs defaultValue="master" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="master">Master Outline</TabsTrigger>
            <TabsTrigger value="individual">Individual Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="master">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap">{outline.outline}</div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="individual">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="space-y-8">
                {outline.searchResults.map((result, index) => (
                  <div key={index} className="space-y-2 pb-4 border-b last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-base">
                          Competitor #{index + 1}: {result.title}
                        </h4>
                        <a 
                          href={result.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {result.link}
                        </a>
                      </div>
                      {result.position && (
                        <span className="text-sm text-gray-500">
                          SERP Position: {result.position}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{result.snippet}</p>
                    {/* Individual analysis would go here once we modify the backend to return it */}
                    <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                      Analysis coming soon...
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
