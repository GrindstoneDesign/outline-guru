
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { SearchResult, OutlineData } from "@/types/outline";
import { useSubscription } from "@/hooks/useSubscription";
import { useRecentAnalyses } from "@/hooks/useRecentAnalyses";
import { outlineService } from "@/services/outlineService";

export const useOutlineGeneration = () => {
  const [keywordOutline, setKeywordOutline] = React.useState<OutlineData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [manualMode, setManualMode] = React.useState(false);
  const [manualUrls, setManualUrls] = React.useState<string[]>([]);
  const { toast } = useToast();
  const { subscription } = useSubscription();
  const { recentAnalyses, refetchAnalyses } = useRecentAnalyses();

  const handleGenerateOutline = async (keyword: string, searchEngine: "google" | "duckduckgo") => {
    setIsLoading(true);
    setProgress(10);
    setCurrentStep(0);

    try {
      if (searchEngine === 'google' && (!subscription || subscription.subscription_plans.name === 'Starter')) {
        toast({
          title: "Upgrade Required",
          description: "Google search is only available on Pro and Agency plans",
          variant: "destructive",
        });
        return;
      }

      const data = await outlineService.generateOutline({
        keyword,
        searchEngine,
        manualUrls: manualMode ? manualUrls : undefined
      });

      if (data && typeof data.outline === 'string' && Array.isArray(data.searchResults)) {
        await outlineService.saveAnalysis({
          keyword,
          searchEngine,
          outline: data.outline,
          searchResults: data.searchResults
        });

        refetchAnalyses();
        setKeywordOutline({
          outline: data.outline,
          searchResults: data.searchResults.filter(result => result.title && result.link)
        });

        toast({
          title: "Success",
          description: "Successfully generated outline for keyword.",
        });
        
        setManualMode(false);
        setManualUrls([]);
      } else {
        throw new Error("Invalid data structure received");
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
      const data = await outlineService.generateOutline({
        manualUrls,
        isManualMode: true
      });

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

  return {
    keywordOutline,
    isLoading,
    progress,
    currentStep,
    manualMode,
    manualUrls,
    recentAnalyses,
    subscription,
    handleGenerateOutline,
    handleAddManualUrl,
    handleRemoveManualUrl,
    handleManualAnalysis,
    handleExport,
    handleHistoryItemClick,
    setManualMode
  };
};

export type { SearchResult, OutlineData };
