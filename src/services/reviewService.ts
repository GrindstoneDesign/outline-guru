
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

export const reviewService = {
  analyzeReviews: async (params: { 
    keyword: string;
    location?: string;
  }) => {
    const { data, error } = await supabase.functions.invoke('analyze-reviews', {
      body: params
    });

    if (error) throw error;
    return data as { success: boolean; reviews: ReviewAnalysis[] };
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
