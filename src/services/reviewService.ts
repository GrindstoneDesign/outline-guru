
import { supabase } from "@/integrations/supabase/client";

export interface ReviewAnalysis {
  id: string;
  business_name: string;
  business_location: string | null;
  rating: number | null;
  review_text: string;
  review_date: string | null;
  reviewer_name: string | null;
  keyword: string;
  topic: string | null;
  category: string | null;
  message_type: string | null;
  feedback_location: string | null;
  review_source: string | null;
  source_link: string | null;
  sentiment_analysis: any | null;
  created_at: string;
  competitor_url: string | null;
}

export interface AnalysisStep {
  label: string;
  status: "pending" | "in-progress" | "completed" | "error";
}

export const reviewService = {
  analyzeReviews: async (params: { 
    keyword: string;
    location?: string;
  }, onProgress?: (step: number, progress: number) => void) => {
    const steps: AnalysisStep[] = [
      { label: "Searching businesses", status: "pending" },
      { label: "Fetching reviews", status: "pending" },
      { label: "Analyzing reviews", status: "pending" }
    ];

    try {
      onProgress?.(0, 0);
      steps[0].status = "in-progress";

      const { data, error } = await supabase.functions.invoke('analyze-reviews', {
        body: params
      });

      if (error) throw error;
      
      if (!data.reviews || data.reviews.length === 0) {
        console.log('No reviews found:', data);
      } else {
        console.log(`Found ${data.reviews.length} reviews:`, data.reviews);
      }

      return data as { success: boolean; reviews: ReviewAnalysis[] };
    } catch (error) {
      console.error('Error in analyzeReviews:', error);
      throw error;
    }
  },

  getStoredReviews: async () => {
    const { data, error } = await supabase
      .from('business_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ReviewAnalysis[];
  }
};
