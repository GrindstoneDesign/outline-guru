
import React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  reviewService,
  ReviewAnalysis,
  AnalysisStep
} from "@/services/reviewService";
import { useToast } from "@/hooks/use-toast";
import { ProgressTracker } from "@/components/ProgressTracker";

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

    // Update steps status
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

      // Mark final step as completed
      steps[steps.length - 1].status = "completed";
      setProgress(100);

      // Validate all competitor URLs before setting the reviews
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

      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="keyword" className="text-sm font-medium">
                Business Type / Keyword
              </label>
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., coffee shop, dentist, gym"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location (optional)
              </label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, NY"
                disabled={isLoading}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !keyword.trim()}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Reviews...
              </span>
            ) : (
              "Analyze Reviews"
            )}
          </Button>
        </form>
      </Card>

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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Filter by Category
              </label>
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="motivation">Motivation</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="anxiety">Anxiety</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Filter by Message Type
              </label>
              <Select
                value={filterMessageType}
                onValueChange={setFilterMessageType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Pain Point">Pain Point</SelectItem>
                  <SelectItem value="Purchase Prompt">Purchase Prompt</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="Praise">Praise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Message Type</TableHead>
                  <TableHead>Competitor URL</TableHead>
                  <TableHead>Key Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{review.business_name}</TableCell>
                    <TableCell>{review.rating}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate">{review.review_text}</div>
                    </TableCell>
                    <TableCell>{review.topic}</TableCell>
                    <TableCell>{review.category}</TableCell>
                    <TableCell>{review.message_type}</TableCell>
                    <TableCell>
                      {review.competitor_url ? (
                        <a 
                          href={review.competitor_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block max-w-xs"
                        >
                          {review.competitor_url}
                        </a>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{review.feedback_location}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

