
import React from "react";
import { KeywordInput } from "@/components/KeywordInput";
import { ProgressTracker } from "@/components/ProgressTracker";
import { OutlineDisplay } from "@/components/OutlineDisplay";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [outline, setOutline] = React.useState("");

  const steps = [
    { label: "Fetching search results", status: "pending" },
    { label: "Analyzing competitor content", status: "pending" },
    { label: "Generating master outline", status: "pending" },
  ];

  const handleSubmit = async (keyword: string) => {
    setIsLoading(true);
    setProgress(0);
    setCurrentStep(0);

    try {
      // Simulate API calls and processing for now
      // Step 1: Fetch search results
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProgress(33);
      setCurrentStep(1);

      // Step 2: Analyze competitor content
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setProgress(66);
      setCurrentStep(2);

      // Step 3: Generate master outline
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProgress(100);

      // Set dummy outline data
      setOutline(`# ${keyword} - Master Outline

## Introduction
- Overview of ${keyword}
- Importance in modern context
- Key statistics and trends

## Core Concepts
- Definition and fundamentals
- Historical evolution
- Current best practices

## Implementation Strategies
- Step-by-step guide
- Tools and resources
- Common challenges and solutions

## Best Practices
- Industry standards
- Expert recommendations
- Case studies

## Future Trends
- Emerging technologies
- Predicted developments
- Preparation strategies

## Conclusion
- Key takeaways
- Action items
- Additional resources`);

      toast({
        title: "Success",
        description: "Master outline generated successfully",
      });
    } catch (error) {
      console.error("Error generating outline:", error);
      toast({
        title: "Error",
        description: "Failed to generate outline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([outline], { type: "text/plain" });
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
          
          {outline && !isLoading && (
            <OutlineDisplay outline={outline} onExport={handleExport} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
