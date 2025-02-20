
import { KeywordInput } from "@/components/KeywordInput";
import { ProgressTracker } from "@/components/ProgressTracker";
import { OutlineDisplay } from "@/components/OutlineDisplay";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/ui/navbar";
import React from "react";

interface OutlineData {
  outline: string;
  searchResults: Array<{
    title: string;
    snippet: string;
    link: string;
    position?: number;
    analysis?: string;
  }>;
}

export default function App() {
  const [keywordOutline, setKeywordOutline] = React.useState<OutlineData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);
  const { toast } = useToast();

  const steps = [
    { label: "Fetching search results", status: "pending" as const },
    { label: "Analyzing competitor content", status: "pending" as const },
    { label: "Generating master outline", status: "pending" as const },
  ];

  const handleGenerateOutline = async (keyword: string, searchEngine: "google" | "duckduckgo") => {
    setIsLoading(true);
    setProgress(10);
    setCurrentStep(0);

    try {
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: {
          keyword: keyword,
          searchEngine: searchEngine
        }
      });

      if (error) {
        console.error("Function invocation error:", error);
        toast({
          title: "Error",
          description: "Failed to generate outline. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        setProgress(0);
        return;
      }

      if (data) {
        console.log("Received data:", data);
        setKeywordOutline(data);
        setProgress(100);
        toast({
          title: "Outline Generated",
          description: "Successfully generated outline for keyword.",
        });
      } else {
        toast({
          title: "Unexpected Error",
          description: "Failed to generate outline. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting outline:", keywordOutline);
    toast({
      title: "Export Started",
      description: "Your outline is being exported...",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          SEO Content Outline Generator
        </h1>
        <KeywordInput onSubmit={handleGenerateOutline} isLoading={isLoading} />
        {isLoading && (
          <ProgressTracker
            steps={steps}
            currentStep={currentStep}
            progress={progress}
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
