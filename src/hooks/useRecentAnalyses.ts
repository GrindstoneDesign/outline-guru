import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";

type CompetitorAnalysis = Tables<"competitor_analyses">;

export const useRecentAnalyses = (limit = 20) => {
  const [page, setPage] = useState(1);
  
  const { data: recentAnalyses, isLoading, error, refetch: refetchAnalyses } = useQuery({
    queryKey: ['competitor-analyses', page, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitor_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return data as CompetitorAnalysis[];
    },
  });

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const loadPrevious = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  return { 
    recentAnalyses: recentAnalyses || [], 
    isLoading, 
    error, 
    refetchAnalyses,
    loadMore,
    loadPrevious,
    page,
    hasMore: recentAnalyses?.length === limit
  };
};
