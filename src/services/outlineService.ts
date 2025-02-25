
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/outline";
import { Json } from "@/integrations/supabase/types";

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
    // Convert SearchResult[] to a JSON-compatible format
    const jsonSearchResults = params.searchResults
      .filter(result => result.title && result.link)
      .map(result => ({
        title: result.title,
        snippet: result.snippet,
        link: result.link,
        position: result.position,
        analysis: result.analysis
      })) as Json;

    const { error } = await supabase
      .from('competitor_analyses')
      .insert({
        keyword: params.keyword,
        search_engine: params.searchEngine,
        outline: params.outline,
        search_results: jsonSearchResults
      });

    if (error) throw error;
  }
};

