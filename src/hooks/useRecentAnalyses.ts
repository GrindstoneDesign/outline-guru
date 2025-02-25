
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRecentAnalyses = () => {
  const { data: recentAnalyses, refetch: refetchAnalyses } = useQuery({
    queryKey: ['competitor-analyses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitor_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return { recentAnalyses, refetchAnalyses };
};
