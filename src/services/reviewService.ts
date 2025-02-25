
import { supabase } from "@/integrations/supabase/client";

export interface ReviewAnalysis {
  business_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  reviewer_name: string;
  location: string;
  keyword: string;
  topic: string;
  category: 'motivation' | 'value' | 'anxiety';
  messageType: 'Pain Point' | 'Purchase Prompt' | 'Feature Request' | 'Praise';
  feedbackLocation: string;
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
