
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

    console.log(`Processing request for keyword: ${keyword} using ${searchEngine}`);

    // Get search results
    const organicResults = searchEngine === 'google' 
      ? await fetchGoogleResults(keyword, serpApiKey!)
      : await fetchDuckDuckGoResults(keyword);

    console.log(`Found ${organicResults.length} organic results`);

    // Generate individual analyses
    const individualAnalysesPromise = organicResults.map(async (result, index) => {
      const content = `Analyze this content from competitor ${index + 1}:\n\n${result.title}\n${result.snippet}`;
      const analysis = await generateAnalysis(content, INDIVIDUAL_ANALYSIS_PROMPT, openAIApiKey!);
      console.log(`Generated analysis for competitor ${index + 1}`);
      
      return {
        title: result.title,
        snippet: result.snippet,
        link: result.link,
        position: index + 1,
        analysis: analysis
      };
    });

    const searchResults = await Promise.all(individualAnalysesPromise);
    
    // Generate master strategy
    const masterStrategyContent = `Create a comprehensive content strategy for "${keyword}" based on these competitor analyses:\n\n${searchResults.map(r => r.analysis).join('\n\n=== NEXT COMPETITOR ===\n\n')}`;
    const outline = await generateAnalysis(masterStrategyContent, MASTER_STRATEGY_PROMPT, openAIApiKey!);

    console.log('Successfully generated master outline and all analyses');

    // Return both individual analyses and master outline
    return new Response(
      JSON.stringify({ 
        outline,
        searchResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-outline function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
