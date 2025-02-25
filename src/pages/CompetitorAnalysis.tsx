import React, { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OutlineDisplay } from "@/components/OutlineDisplay";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function CompetitorAnalysis() {
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a keyword to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: { keyword, searchEngine: 'google' }
      });

      if (error) throw error;

      setAnalysisResult(data);
      toast({
        title: "Analysis Complete",
        description: "Competitor analysis has been generated successfully",
      });
    } catch (error) {
      console.error('Error:', error);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 space-y-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-center mb-8 bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
            Competitor Analysis
          </h1>
          
          <div className="space-y-8">
            <Card className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter keyword to analyze..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalysis()}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleAnalysis}
                  disabled={isLoading}
                >
                  {isLoading ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
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