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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleMapsReviewForm } from "@/components/reviews/GoogleMapsReviewForm";
import { googleMapsReviewService, GoogleMapsReviewOptions } from "@/services/googleMapsReviewService";

export default function Reviews() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [googleMapsKeyword, setGoogleMapsKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reviews, setReviews] = useState<ReviewAnalysis[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMessageType, setFilterMessageType] = useState<string>("all");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("google-maps");
  const { toast } = useToast();

  const steps: AnalysisStep[] = [
    { label: "Searching", status: "pending" },
    { label: "Extracting reviews", status: "pending" },
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

  const handleLegacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setCurrentStep(0);
    setProgress(0);
    setReviews([]); // Clear previous reviews
    setRawApiResponse(null); // Clear previous API response

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

      // Store the raw API response for debugging
      setRawApiResponse(result);

      // Mark all steps as completed even if no reviews were found
      // as long as the API call was successful
      steps.forEach(step => step.status = "completed");
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
          description: result.message || "Try adjusting your search terms or location",
          // Change from destructive to default variant for "no reviews" case
          variant: "default",
        });
      } else {
        toast({
          title: "Reviews found",
          description: `Found ${validReviews.length} reviews from ${new Set(validReviews.map(r => r.business_name)).size} businesses`,
        });
      }
    } catch (error) {
      console.error('Error in review analysis:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      
      // Reset progress on error
      steps.forEach(step => step.status = "pending");
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleMapsSubmit = async (keyword: string, options: GoogleMapsReviewOptions) => {
    if (!keyword.trim()) return;
    
    setGoogleMapsKeyword(keyword);
    setIsLoading(true);
    setCurrentStep(0);
    setProgress(0);
    setReviews([]); // Clear previous reviews
    setRawApiResponse(null); // Clear previous API response

    steps[0].status = "in-progress";
    steps[1].status = "pending";
    steps[2].status = "pending";

    try {
      const result = await googleMapsReviewService.scrapeReviewsByKeyword(
        keyword,
        options,
        (step, prog) => {
          setCurrentStep(step);
          setProgress(prog);
          steps[step].status = "in-progress";
          if (step > 0) {
            steps[step - 1].status = "completed";
          }
        }
      );

      // Store the raw API response for debugging
      setRawApiResponse(result);

      // Mark all steps as completed
      steps.forEach(step => step.status = "completed");
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
          description: result.message || "No businesses or reviews found for your search. Try a different keyword or location.",
          variant: "default",
        });
      } else {
        const uniqueBusinesses = new Set(validReviews.map(r => r.business_name)).size;
        toast({
          title: "Reviews found",
          description: `Found ${validReviews.length} reviews from ${uniqueBusinesses} ${uniqueBusinesses === 1 ? 'business' : 'businesses'}`,
        });
      }
    } catch (error) {
      console.error('Error in Google Maps review scraping:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      
      // Reset progress on error
      steps.forEach(step => step.status = "pending");
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save reviews to the database
  const handleSaveToDatabase = async () => {
    if (reviews.length === 0) {
      toast({
        title: "No reviews to save",
        description: "Please search for reviews first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const result = await googleMapsReviewService.saveReviewsToDatabase(reviews);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Warning",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving reviews to database:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while saving reviews",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Function to export the raw API response as a JSON file
  const exportApiResponse = () => {
    if (!rawApiResponse) {
      toast({
        title: "No data to export",
        description: "Please run a search first to generate data for export",
        variant: "destructive",
      });
      return;
    }

    const dataStr = JSON.stringify(rawApiResponse, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileName = activeTab === "google-maps" 
      ? `google-maps-reviews-${googleMapsKeyword.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
      : `review-analysis-${keyword.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    toast({
      title: "Export successful",
      description: `Saved as ${exportFileName}`,
    });
  };

  const filteredReviews = reviews.filter(review => {
    const categoryMatch = filterCategory === "all" || review.category === filterCategory;
    const messageMatch = filterMessageType === "all" || review.message_type === filterMessageType;
    return categoryMatch && messageMatch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-heading font-bold text-center mb-8 bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
        Review Analysis
      </h1>

      <Tabs 
        defaultValue="google-maps" 
        className="w-full mb-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="google-maps">Google Maps Search</TabsTrigger>
          <TabsTrigger value="legacy">Legacy Search</TabsTrigger>
        </TabsList>
        
        <TabsContent value="google-maps" className="mt-4">
          <GoogleMapsReviewForm 
            onSubmit={handleGoogleMapsSubmit}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="legacy" className="mt-4">
          <ReviewSearchForm
            keyword={keyword}
            setKeyword={setKeyword}
            location={location}
            setLocation={setLocation}
            onSubmit={handleLegacySubmit}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {isLoading && (
        <Card className="p-6 mt-8">
          <ProgressTracker
            steps={steps}
            currentStep={currentStep}
            progress={progress}
          />
        </Card>
      )}

      {reviews.length > 0 && (
        <>
          <Card className="p-6 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">
                {reviews.length} Reviews Found
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={exportApiResponse}
                >
                  Export Data
                </Button>
                <Button
                  variant="default"
                  onClick={handleSaveToDatabase}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save to Database"}
                </Button>
              </div>
            </div>

            <ReviewFilters
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterMessageType={filterMessageType}
              setFilterMessageType={setFilterMessageType}
            />
          </Card>

          <ReviewsTable reviews={filteredReviews} />
        </>
      )}
    </div>
  );
}
