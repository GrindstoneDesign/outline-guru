
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
      analysis?: string;
    }>;
  };
  onExport: () => void;
}

export const OutlineDisplay: React.FC<OutlineDisplayProps> = ({ outline, onExport }) => {
  const [selectedCompetitor, setSelectedCompetitor] = React.useState<number>(0);

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
            <div className="space-y-4">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {outline.searchResults.map((result, index) => (
                  <Button
                    key={index}
                    variant={selectedCompetitor === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCompetitor(index)}
                    className="whitespace-nowrap"
                  >
                    Competitor #{index + 1}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                {outline.searchResults[selectedCompetitor] && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-base">
                          {outline.searchResults[selectedCompetitor].title}
                        </h4>
                        {outline.searchResults[selectedCompetitor].position && (
                          <span className="text-sm text-gray-500">
                            SERP Position: {outline.searchResults[selectedCompetitor].position}
                          </span>
                        )}
                      </div>
                      <a
                        href={outline.searchResults[selectedCompetitor].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block"
                      >
                        {outline.searchResults[selectedCompetitor].link}
                      </a>
                      <p className="text-sm text-gray-600 mt-2">
                        {outline.searchResults[selectedCompetitor].snippet}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-2">Detailed Analysis</h5>
                      <div className="whitespace-pre-wrap text-sm">
                        {outline.searchResults[selectedCompetitor].analysis || 
                          "No detailed analysis available for this competitor."}
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
