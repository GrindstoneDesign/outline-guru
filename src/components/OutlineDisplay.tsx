import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  position?: number;
  analysis?: string;
  resultType?: 'organic' | 'local' | 'brand';
  rating?: number;
  reviews?: number;
  address?: string;
  hours?: string;
  type?: string;
}

interface OutlineDisplayProps {
  outline: {
    outline: string;
    searchResults: SearchResult[];
  };
  onExport: () => void;
}

export const OutlineDisplay: React.FC<OutlineDisplayProps> = ({ outline, onExport }) => {
  const [selectedCompetitor, setSelectedCompetitor] = React.useState<number>(0);

  // Early return if no data
  if (!outline || !outline.outline) {
    return null;
  }

  const hasSearchResults = outline.searchResults && outline.searchResults.length > 0;

  return (
    <Card className="p-6 mt-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Content Analysis Results</h3>
          <Button onClick={onExport} variant="outline" size="sm">
            Export
          </Button>
        </div>

        <Tabs defaultValue="master" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="master">Master Outline</TabsTrigger>
            <TabsTrigger value="competitors" disabled={!hasSearchResults}>
              Competitor Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="master" className="mt-4">
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap prose max-w-none">
                {outline.outline}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="competitors" className="mt-4">
            {hasSearchResults ? (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {outline.searchResults.map((_, index) => (
                    <Button
                      key={index}
                      variant={selectedCompetitor === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCompetitor(index)}
                    >
                      Competitor {index + 1}
                    </Button>
                  ))}
                </div>

                <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                  {outline.searchResults[selectedCompetitor] && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-medium">
                            {outline.searchResults[selectedCompetitor].title}
                            {outline.searchResults[selectedCompetitor].resultType && (
                              <span className="ml-2 text-sm text-muted-foreground">
                                ({outline.searchResults[selectedCompetitor].resultType})
                              </span>
                            )}
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            Position: {outline.searchResults[selectedCompetitor].position}
                          </span>
                        </div>
                        <a
                          href={outline.searchResults[selectedCompetitor].link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline block mb-2"
                        >
                          {outline.searchResults[selectedCompetitor].link}
                        </a>
                        <p className="text-sm text-muted-foreground">
                          {outline.searchResults[selectedCompetitor].snippet}
                        </p>
                        {outline.searchResults[selectedCompetitor].resultType === 'local' && (
                          <div className="mt-4 space-y-2">
                            {outline.searchResults[selectedCompetitor].rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm">
                                  {outline.searchResults[selectedCompetitor].rating} 
                                  {outline.searchResults[selectedCompetitor].reviews && 
                                    ` (${outline.searchResults[selectedCompetitor].reviews} reviews)`
                                  }
                                </span>
                              </div>
                            )}
                            {outline.searchResults[selectedCompetitor].address && (
                              <p className="text-sm">
                                📍 {outline.searchResults[selectedCompetitor].address}
                              </p>
                            )}
                            {outline.searchResults[selectedCompetitor].hours && (
                              <p className="text-sm">
                                🕒 {outline.searchResults[selectedCompetitor].hours}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t">
                        <h5 className="font-medium mb-3">Content Structure Analysis</h5>
                        <div className="whitespace-pre-wrap prose max-w-none text-sm">
                          {outline.searchResults[selectedCompetitor].analysis}
                        </div>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No competitor analyses available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
