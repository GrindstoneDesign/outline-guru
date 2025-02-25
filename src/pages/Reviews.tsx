
import React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  reviewService,
  ReviewAnalysis,
  AnalysisStep
} from "@/services/reviewService";
import { useToast } from "@/hooks/use-toast";
import { ProgressTracker } from "@/components/ProgressTracker";
import { ReviewSearchForm } from "@/components/reviews/ReviewSearchForm";
import { ReviewFilters } from "@/components/reviews/ReviewFilters";
import { ReviewsTable } from "@/components/reviews/ReviewsTable";

export default function Reviews() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewAnalysis[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMessageType, setFilterMessageType] = useState<string>("all");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const steps: AnalysisStep[] = [
    { label: "Searching businesses", status: "pending" },
    { label: "Fetching reviews", status: "pending" },
    { label: "Analyzing content", status: "pending" }
  ];

  const validateUrl = (url: string | null): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setCurrentStep(0);
    setProgress(0);

    steps[0].status = "in-progress";
    steps[1].status = "pending";
    steps[2].status = "pending";

    try {
      const result = await reviewService.analyzeReviews(
        {
          keyword: keyword.trim(),
          location: location.trim() || undefined
        },
        (step, prog) => {
          setCurrentStep(step);
          setProgress(prog);
          steps[step].status = "in-progress";
          if (step > 0) {
            steps[step - 1].status = "completed";
          }
        }
      );

      steps[steps.length - 1].status = "completed";
      setProgress(100);

      const validReviews = result.reviews.map(review => {
        if (review.competitor_url && !validateUrl(review.competitor_url)) {
          toast({
            title: "Warning",
            description: `Invalid competitor URL found for ${review.business_name}. URL will not be displayed.`,
            variant: "destructive",
          });
          return { ...review, competitor_url: null };
        }
        return review;
      });

      setReviews(validReviews);
      
      if (validReviews.length === 0) {
        toast({
          title: "No reviews found",
          description: "Try adjusting your search terms or location",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Analyzed ${validReviews.length} reviews`,
        });
      }
    } catch (error) {
      console.error('Error analyzing reviews:', error);
      steps[currentStep].status = "error";
      toast({
        title: "Error",
        description: "Failed to analyze reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const categoryMatch = filterCategory === "all" || review.category === filterCategory;
    const messageMatch = filterMessageType === "all" || review.message_type === filterMessageType;
    return categoryMatch && messageMatch;
  });

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Review Analysis
      </h1>

      <ReviewSearchForm
        keyword={keyword}
        location={location}
        isLoading={isLoading}
        onKeywordChange={setKeyword}
        onLocationChange={setLocation}
        onSubmit={handleSubmit}
      />

      {isLoading && (
        <Card className="p-6 mb-8">
          <ProgressTracker
            steps={steps}
            currentStep={currentStep}
            progress={progress}
          />
        </Card>
      )}

      {reviews.length > 0 && (
        <div className="space-y-4">
          <ReviewFilters
            filterCategory={filterCategory}
            filterMessageType={filterMessageType}
            onCategoryChange={setFilterCategory}
            onMessageTypeChange={setFilterMessageType}
          />
          <ReviewsTable reviews={filteredReviews} />
        </div>
      )}
    </div>
  );
}
