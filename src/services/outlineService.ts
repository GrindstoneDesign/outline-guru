
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/outline";

export const outlineService = {
  generateOutline: async (params: {
    keyword?: string;
    searchEngine?: "google" | "duckduckgo";
    manualUrls?: string[];
    isManualMode?: boolean;
  }) => {
    const { data, error } = await supabase.functions.invoke('generate-outline', {
      body: params
    });

    if (error) throw error;
    return data;
  },

  saveAnalysis: async (params: {
    keyword: string;
    searchEngine: string;
    outline: string;
    searchResults: SearchResult[];
  }) => {
    const { error } = await supabase
      .from('competitor_analyses')
      .insert({
        keyword: params.keyword,
        search_engine: params.searchEngine,
        outline: params.outline,
        search_results: params.searchResults.filter(result => result.title && result.link)
      });

    if (error) throw error;
  }
};
