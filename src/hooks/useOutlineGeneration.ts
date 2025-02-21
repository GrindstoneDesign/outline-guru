
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface ApiResponse {
  success: boolean;
  error?: string;
  data?: {
    outline: string;
    searchResults: SearchResult[];
  };
}

export const useOutlineGeneration = () => {
  const [keywordOutline, setKeywordOutline] = React.useState<OutlineData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [manualMode, setManualMode] = React.useState(false);
  const [manualUrls, setManualUrls] = React.useState<string[]>([]);
  const { toast } = useToast();

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

  // Get user's subscription status
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleGenerateOutline = async (keyword: string, searchEngine: "google" | "duckduckgo") => {
    setIsLoading(true);
    setProgress(10);
    setCurrentStep(0);

    try {
      // Check subscription for Google search access
      if (searchEngine === 'google' && (!subscription || subscription.subscription_plans.name === 'Starter')) {
        toast({
          title: "Upgrade Required",
          description: "Google search is only available on Pro and Agency plans",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

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
