
import React from "react";
import { KeywordInput } from "@/components/KeywordInput";
import { ProgressTracker } from "@/components/ProgressTracker";
import { OutlineDisplay } from "@/components/OutlineDisplay";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OutlineData {
  outline: string;
  searchResults: any[];
}

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [outlineData, setOutlineData] = React.useState<OutlineData | null>(null);

  const steps = [
    { label: "Fetching search results", status: "pending" as const },
    { label: "Analyzing competitor content", status: "pending" as const },
    { label: "Generating master outline", status: "pending" as const },
  ];

  const handleSubmit = async (keyword: string, searchEngine: "google" | "duckduckgo") => {
    setIsLoading(true);
    setProgress(0);
    setCurrentStep(0);
    setOutlineData(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: { keyword, searchEngine }
      });

      if (error) throw error;

      if (data) {
        setOutlineData(data);
        toast({
          title: "Success",
          description: "Master outline generated successfully",
        });
      }
    } catch (error) {
      console.error("Error generating outline:", error);
      toast({
        title: "Error",
        description: "Failed to generate outline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProgress(100);
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!outlineData) return;

    const blob = new Blob([outlineData.outline], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "master-outline.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Outline has been downloaded successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-fade-down">
          <h1 className="text-4xl font-bold">Outline Guru</h1>
          <p className="text-lg text-gray-600">
            Generate comprehensive outlines from top search results
          </p>
        </div>

        <div className="grid gap-8">
          <KeywordInput onSubmit={handleSubmit} isLoading={isLoading} />
          
          {isLoading && (
            <ProgressTracker
              steps={steps}
              currentStep={currentStep}
              progress={progress}
            />
          )}
          
          {outlineData && !isLoading && (
            <OutlineDisplay 
              outline={outlineData} 
              onExport={handleExport}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
