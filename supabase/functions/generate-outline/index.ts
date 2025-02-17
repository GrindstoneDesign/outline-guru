
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
            content: `You are an expert content strategist and outline generator. Your task is to:
1. Analyze competitor content for structure and key topics
2. Identify gaps in existing content
3. Create a comprehensive, well-structured outline that:
   - Covers all important aspects of the topic
   - Uses clear hierarchical structure (H1, H2, H3)
   - Includes relevant subsections
   - Maintains logical flow and progression
   - Incorporates unique angles missing from competitor content
Format the outline using markdown with proper indentation and bullet points.`
          },
          {
            role: 'user',
            content: `Create a detailed, comprehensive outline for "${keyword}". 
Here are the top search results to analyze and improve upon:

${competitorContent}

Instructions:
1. Start with an engaging introduction section
2. Break down main concepts into clear subsections
3. Include practical examples or case studies where relevant
4. Add a section for best practices or tips
5. End with a conclusion and next steps
6. Use proper markdown formatting with clean hierarchy`
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
