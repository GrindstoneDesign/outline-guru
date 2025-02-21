
import { KeywordInput } from "@/components/KeywordInput";
import { ProgressTracker } from "@/components/ProgressTracker";
import { OutlineDisplay } from "@/components/OutlineDisplay";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/ui/navbar";
import { HistoryDisplay } from "@/components/HistoryDisplay";
import { ManualUrlInput } from "@/components/ManualUrlInput";
import { Button } from "@/components/ui/button";
import React from "react";
import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  position?: number;
  analysis?: string;
}

interface OutlineData {
  outline: string;
  searchResults: SearchResult[];
}

export default function App() {
  const [keywordOutline, setKeywordOutline] = React.useState<OutlineData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [manualMode, setManualMode] = React.useState(false);
  const [manualUrls, setManualUrls] = React.useState<string[]>([]);
  const { toast } = useToast();

  const steps = [
    { label: "Fetching search results", status: "pending" as const },
    { label: "Analyzing competitor content", status: "pending" as const },
    { label: "Generating master outline", status: "pending" as const },
  ];

  // Fetch recent analyses
  const { data: recentAnalyses, refetch: refetchAnalyses } = useQuery({
    queryKey: ['competitor-analyses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitor_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const handleGenerateOutline = async (keyword: string, searchEngine: "google" | "duckduckgo") => {
    setIsLoading(true);
    setProgress(10);
    setCurrentStep(0);

    try {
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: {
          keyword,
          searchEngine,
          manualUrls: manualMode ? manualUrls : undefined
        }
      });

      if (error) {
        console.error("Function invocation error:", error);
        toast({
          title: "Error",
          description: "Failed to generate outline. You can try adding URLs manually.",
          variant: "destructive",
        });
        setManualMode(true);
        return;
      }

      if (data) {
        console.log("Received outline data:", data);
        if (typeof data.outline === 'string' && Array.isArray(data.searchResults)) {
          // Store the analysis in the database
          const { error: dbError } = await supabase
            .from('competitor_analyses')
            .insert({
              keyword,
              search_engine: searchEngine,
              outline: data.outline,
              search_results: data.searchResults.filter(result => result.title && result.link)
            });

          if (dbError) {
            console.error("Error storing analysis:", dbError);
          } else {
            refetchAnalyses();
          }

          setKeywordOutline({
            outline: data.outline,
            searchResults: data.searchResults.filter(result => result.title && result.link)
          });
          toast({
            title: "Success",
            description: "Successfully generated outline for keyword.",
          });
          
          // Reset manual mode after successful analysis
          setManualMode(false);
          setManualUrls([]);
        } else {
          console.error("Invalid data structure received:", data);
          toast({
            title: "Error",
            description: "Received invalid data format. Please try again or add URLs manually.",
            variant: "destructive",
          });
          setManualMode(true);
        }
      }
    } catch (err) {
      console.error("Error generating outline:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. You can try adding URLs manually.",
        variant: "destructive",
      });
      setManualMode(true);
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCurrentStep(0);
    }
  };

  const handleAddManualUrl = (url: string) => {
    setManualUrls([...manualUrls, url]);
  };

  const handleRemoveManualUrl = (index: number) => {
    setManualUrls(manualUrls.filter((_, i) => i !== index));
  };

  const handleManualAnalysis = async () => {
    if (manualUrls.length === 0) return;
    setIsLoading(true);
    setProgress(10);
    setCurrentStep(0);

    try {
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: {
          manualUrls,
          isManualMode: true
        }
      });

      if (error) {
        console.error("Manual analysis error:", error);
        toast({
          title: "Error",
          description: "Failed to analyze URLs. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data && typeof data.outline === 'string' && Array.isArray(data.searchResults)) {
        setKeywordOutline({
          outline: data.outline,
          searchResults: data.searchResults.filter(result => result.title && result.link)
        });
        toast({
          title: "Success",
          description: "Successfully analyzed competitor URLs.",
        });
      }
    } catch (err) {
      console.error("Manual analysis error:", err);
      toast({
        title: "Error",
        description: "Failed to analyze URLs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCurrentStep(0);
    }
  };

  const handleExport = () => {
    if (!keywordOutline) return;
    
    console.log("Exporting outline:", keywordOutline);
    toast({
      title: "Export Started",
      description: "Your outline is being exported...",
    });
  };

  const handleHistoryItemClick = (analysis: any) => {
    setKeywordOutline({
      outline: analysis.outline,
      searchResults: analysis.search_results
    });
    toast({
      title: "Analysis Loaded",
      description: `Loaded analysis for "${analysis.keyword}"`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          SEO Content Outline Generator
        </h1>
        {!manualMode ? (
          <KeywordInput onSubmit={handleGenerateOutline} isLoading={isLoading} />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manual URL Analysis</h2>
              <Button
                variant="outline"
                onClick={() => setManualMode(false)}
              >
                Switch to Keyword Search
              </Button>
            </div>
            <ManualUrlInput
              urls={manualUrls}
              onAddUrl={handleAddManualUrl}
              onRemoveUrl={handleRemoveManualUrl}
              onSubmit={handleManualAnalysis}
            />
          </div>
        )}
        {isLoading && (
          <ProgressTracker
            steps={steps}
            currentStep={currentStep}
            progress={progress}
          />
        )}
        {recentAnalyses && recentAnalyses.length > 0 && (
          <HistoryDisplay 
            analyses={recentAnalyses} 
            onItemClick={handleHistoryItemClick} 
          />
        )}
        {keywordOutline && (
          <OutlineDisplay 
            outline={keywordOutline} 
            onExport={handleExport}
          />
        )}
      </div>
    </div>
  );
}
