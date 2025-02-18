import { KeywordInput } from "@/components/KeywordInput";
import { ProgressTracker } from "@/components/ProgressTracker";
import { OutlineDisplay } from "@/components/OutlineDisplay";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import React from "react";

export default function App() {
  const [keywordOutline, setKeywordOutline] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const { toast } = useToast();

  const handleGenerateOutline = async (keyword: string, searchEngine: "google" | "duckduckgo") => {
    setIsLoading(true);
    setProgress(10);

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

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        SEO Content Outline Generator
      </h1>
      <KeywordInput onSubmit={handleGenerateOutline} isLoading={isLoading} />
      <ProgressTracker progress={progress} isLoading={isLoading} />
      {keywordOutline && <OutlineDisplay outline={keywordOutline} />}
    </div>
  );
}
