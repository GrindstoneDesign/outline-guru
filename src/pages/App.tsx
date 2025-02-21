
import { ProgressTracker } from "@/components/ProgressTracker";
import { OutlineDisplay } from "@/components/OutlineDisplay";
import { HistoryDisplay } from "@/components/HistoryDisplay";
import { OutlineInputSection } from "@/components/OutlineInputSection";
import { Navbar } from "@/components/ui/navbar";
import { useOutlineGeneration } from "@/hooks/useOutlineGeneration";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function App() {
  const navigate = useNavigate();
  const {
    keywordOutline,
    isLoading,
    progress,
    currentStep,
    manualMode,
    manualUrls,
    recentAnalyses,
    handleGenerateOutline,
    handleAddManualUrl,
    handleRemoveManualUrl,
    handleManualAnalysis,
    handleExport,
    handleHistoryItemClick,
    setManualMode
  } = useOutlineGeneration();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const steps = [
    { label: "Fetching search results", status: "pending" as const },
    { label: "Analyzing competitor content", status: "pending" as const },
    { label: "Generating master outline", status: "pending" as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          SEO Content Outline Generator
        </h1>
        <OutlineInputSection
          isLoading={isLoading}
          manualMode={manualMode}
          manualUrls={manualUrls}
          onGenerateOutline={handleGenerateOutline}
          onAddUrl={handleAddManualUrl}
          onRemoveUrl={handleRemoveManualUrl}
          onManualAnalysis={handleManualAnalysis}
          onSwitchMode={() => setManualMode(false)}
        />
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
