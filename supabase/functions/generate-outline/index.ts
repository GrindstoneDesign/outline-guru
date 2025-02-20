
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fetchDuckDuckGoResults, fetchGoogleResults } from "./search-engines.ts";
import { INDIVIDUAL_ANALYSIS_PROMPT, MASTER_STRATEGY_PROMPT } from "./prompts.ts";
import { generateAnalysis } from "./openai.ts";

const serpApiKey = Deno.env.get('SERP_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, searchEngine } = await req.json();

    // Get search results
    const organicResults = searchEngine === 'google' 
      ? await fetchGoogleResults(keyword, serpApiKey!)
      : await fetchDuckDuckGoResults(keyword);

    // Generate individual analyses
    const individualAnalysesPromise = organicResults.map(async (result, index) => {
      const content = `Analyze this content from competitor ${index + 1}:\n\n${result.title}\n${result.snippet}`;
      return generateAnalysis(content, INDIVIDUAL_ANALYSIS_PROMPT, openAIApiKey!);
    });

    const individualAnalyses = await Promise.all(individualAnalysesPromise);
    
    // Generate master strategy
    const masterStrategyContent = `Create a comprehensive content strategy for "${keyword}" based on these competitor analyses:\n\n${individualAnalyses.join('\n\n=== NEXT COMPETITOR ===\n\n')}`;
    const outline = await generateAnalysis(masterStrategyContent, MASTER_STRATEGY_PROMPT, openAIApiKey!);

    return new Response(
      JSON.stringify({ outline, searchResults: organicResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
