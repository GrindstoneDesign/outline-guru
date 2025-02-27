import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";
import { OutlineDisplay } from "@/components/OutlineDisplay";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HistorySidebar } from "@/components/HistorySidebar";
import { useRecentAnalyses } from "@/hooks/useRecentAnalyses";
import { Tables } from "@/integrations/supabase/types";
import { OutlineData, SearchResult } from "@/types/outline";
import { KeywordInput } from "@/components/KeywordInput";
import { useSubscription } from "@/hooks/useSubscription";

type CompetitorAnalysis = Tables<"competitor_analyses">;

export default function CompetitorAnalysis() {
  const [keyword, setKeyword] = useState("");
  const [searchEngine, setSearchEngine] = useState<"google" | "duckduckgo">("duckduckgo");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<OutlineData | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  const { recentAnalyses, refetchAnalyses } = useRecentAnalyses();
  const { subscription } = useSubscription();

  // Load analyses when the component mounts
  useEffect(() => {
    refetchAnalyses();
  }, [refetchAnalyses]);

  const handleAnalysis = async (inputKeyword: string, inputSearchEngine: "google" | "duckduckgo") => {
    setKeyword(inputKeyword);
    setSearchEngine(inputSearchEngine);
    
    if (!inputKeyword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a keyword to analyze",
        variant: "destructive",
      });
      return;
    }

    // Check subscription for Google search
    if (inputSearchEngine === 'google' && (!subscription || subscription?.subscription_plans?.name === 'Starter')) {
      toast({
        title: "Upgrade Required",
        description: "Google search is only available on Pro and Agency plans",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Invoking Supabase function with keyword: ${inputKeyword} using ${inputSearchEngine}`);
      
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: { keyword: inputKeyword, searchEngine: inputSearchEngine }
      });

      console.log("Supabase function response:", { data, error });

      if (error) throw error;

      setAnalysisResult(data);
      
      // Save the analysis to the database
      await supabase
        .from('competitor_analyses')
        .insert({
          keyword: inputKeyword,
          search_engine: inputSearchEngine,
          outline: data.outline,
          search_results: data.searchResults
        });
      
      // Refresh the analyses list
      refetchAnalyses();
      
      toast({
        title: "Analysis Complete",
        description: "Competitor analysis has been generated successfully",
      });
    } catch (error) {
      console.error('Error invoking Supabase function:', error);
      toast({
        title: "Error",
        description: "Failed to generate competitor analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!analysisResult) return;
    
    const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `competitor-analysis-${keyword.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleHistoryItemClick = (analysis: CompetitorAnalysis) => {
    setKeyword(analysis.keyword);
    setSearchEngine(analysis.search_engine as "google" | "duckduckgo");
    setAnalysisResult({
      outline: analysis.outline || "",
      searchResults: analysis.search_results as SearchResult[] || []
    });
    
    toast({
      title: "Analysis Loaded",
      description: `Loaded analysis for "${analysis.keyword}"`,
    });
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* History Sidebar */}
      <HistorySidebar 
        analyses={recentAnalyses}
        onItemClick={handleHistoryItemClick}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      <main className={`container mx-auto py-8 px-4 space-y-8 transition-all duration-300 ${!isSidebarCollapsed ? 'ml-72' : ''}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-center mb-8 bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
            Competitor Analysis
          </h1>
          
          <div className="space-y-8">
            <Card className="p-6">
              <KeywordInput 
                onSubmit={handleAnalysis}
                isLoading={isLoading}
              />
            </Card>

            {analysisResult && (
              <OutlineDisplay 
                outline={analysisResult} 
                onExport={handleExport}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 