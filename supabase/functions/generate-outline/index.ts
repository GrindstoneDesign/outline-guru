
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { keyword } = await req.json();

    // Step 1: Fetch search results using SERP API
    const searchUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&api_key=${serpApiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    // Extract organic results and their snippets
    const organicResults = searchData.organic_results?.slice(0, 5) || [];
    const competitorContent = organicResults
      .map(result => `${result.title}\n${result.snippet}`)
      .join('\n\n');

    // Step 2: Use OpenAI to analyze and generate outline
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content outline generator. Analyze the competitor content and create a comprehensive, well-structured outline that covers all important aspects of the topic.'
          },
          {
            role: 'user',
            content: `Create a detailed outline for the topic "${keyword}" based on these top search results:\n\n${competitorContent}`
          }
        ],
      }),
    });

    const aiData = await openAIResponse.json();
    const outline = aiData.choices[0].message.content;

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
