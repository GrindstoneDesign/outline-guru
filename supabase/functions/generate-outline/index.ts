// Deno-specific imports
import "xhr";
import { serve } from "./deps.ts";
import { fetchDuckDuckGoResults, fetchGoogleResults } from "./search-engines.ts";
import { generateAnalysis } from "./openai.ts";

// Define types for our data
interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

interface AnalyzedResult extends SearchResult {
  position: number;
  analysis: string;
}

interface RequestData {
  keyword: string;
  searchEngine: 'google' | 'duckduckgo';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, searchEngine } = await req.json() as RequestData;
    console.log(`Starting analysis for keyword: ${keyword}`);

    // Get search results
    const serpApiKey = Deno.env.get('SERP_API_KEY');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!serpApiKey || !openAIApiKey) {
      throw new Error('Missing required API keys');
    }

    const organicResults = searchEngine === 'google' 
      ? await fetchGoogleResults(keyword, serpApiKey)
      : await fetchDuckDuckGoResults(keyword);

    console.log(`Found ${organicResults.length} search results`);

    // For each result, analyze its content structure
    const analyzedResults = await Promise.all(
      organicResults.map(async (result: SearchResult, index: number) => {
        const analysisPrompt = `
          Analyze this webpage's content structure and outline:
          Title: ${result.title}
          Description: ${result.snippet}
          
          Please provide:
          1. Key sections and headings identified
          2. Content structure analysis
          3. Notable elements or patterns
          4. SEO strengths and opportunities
          
          Format as a clear, structured outline.
        `;

        const analysis = await generateAnalysis(analysisPrompt, "You are an expert SEO content analyst. Analyze the webpage content structure and provide clear, actionable insights.", openAIApiKey);
        
        console.log(`Completed analysis for result ${index + 1}`);
        
        return {
          title: result.title,
          snippet: result.snippet,
          link: result.link,
          position: index + 1,
          analysis: analysis
        };
      })
    );

    // Create master outline based on analyzed results
    const masterOutlinePrompt = `
      Based on the analysis of ${analyzedResults.length} top-ranking pages for "${keyword}", create a comprehensive content outline that:
      1. Incorporates the best elements from each competitor
      2. Addresses any gaps in competitor content
      3. Suggests a clear, logical structure
      4. Includes specific recommendations for each section
      
      Format as a detailed, well-structured outline.
    `;

    const masterOutline = await generateAnalysis(
      masterOutlinePrompt,
      "You are an expert SEO content strategist. Create a comprehensive content outline based on competitor analysis.", 
      openAIApiKey
    );

    console.log("Analysis complete - returning results");

    return new Response(
      JSON.stringify({ 
        outline: masterOutline,
        searchResults: analyzedResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
