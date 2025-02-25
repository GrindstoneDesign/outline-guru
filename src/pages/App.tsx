
import { ProgressTracker } from "@/components/ProgressTracker";
import { OutlineDisplay } from "@/components/OutlineDisplay";
import { HistoryDisplay } from "@/components/HistoryDisplay";
import { OutlineInputSection } from "@/components/OutlineInputSection";
import { Navbar } from "@/components/ui/navbar";
import { useOutlineGeneration } from "@/hooks/useOutlineGeneration";
import React from "react";

export default function App() {
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

  const steps = [
    { label: "Fetching search results", status: "pending" as const },
    { label: "Analyzing competitor content", status: "pending" as const },
    { label: "Generating master outline", status: "pending" as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 space-y-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-center mb-8 bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
            SEO Content Outline Generator
          </h1>
          
          <div className="space-y-8">
            <div className="card animate-fade-in">
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
            </div>

            {isLoading && (
              <div className="card animate-fade-in">
                <ProgressTracker
                  steps={steps}
                  currentStep={currentStep}
                  progress={progress}
                />
              </div>
            )}

            {recentAnalyses && recentAnalyses.length > 0 && (
              <div className="card animate-fade-in">
                <HistoryDisplay 
                  analyses={recentAnalyses} 
                  onItemClick={handleHistoryItemClick} 
                />
              </div>
            )}

            {keywordOutline && (
              <div className="card animate-fade-in">
                <OutlineDisplay 
                  outline={keywordOutline} 
                  onExport={handleExport}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

