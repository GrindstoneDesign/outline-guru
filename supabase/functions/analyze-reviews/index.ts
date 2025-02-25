
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const serpApiKey = Deno.env.get('SERP_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchReviews(keyword: string, location: string) {
  const params = new URLSearchParams({
    api_key: serpApiKey!,
    engine: 'google_maps_reviews',
    q: keyword,
    location: location || '',
    type: 'review',
    num: '5'  // Fetch top 5 reviews
  });

  const response = await fetch(`https://serpapi.com/search.json?${params}`);
  const data = await response.json();
  return data.reviews || [];
}

async function analyzeReview(review: any) {
  const prompt = `
    Analyze this business review and provide:
    1. Main Topic/Theme
    2. Category (motivation, value, or anxiety)
    3. Message Type (Pain Point/Problem, Purchase Prompt, Feature Request, or Praise)
    4. Key Feedback Location (where in the review the main feedback can be found)

    Review: "${review.snippet}"

    Format response as JSON like:
    {
      "topic": "string",
      "category": "motivation|value|anxiety",
      "messageType": "Pain Point|Purchase Prompt|Feature Request|Praise",
      "feedbackLocation": "string"
    }
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert at analyzing customer reviews and feedback.' },
        { role: 'user', content: prompt }
      ],
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, location } = await req.json();
    console.log(`Starting review analysis for: ${keyword} in ${location || 'any location'}`);

    // Fetch reviews from Google
    const reviews = await fetchReviews(keyword, location);
    console.log(`Found ${reviews.length} reviews`);

    // Analyze each review with ChatGPT
    const analyzedReviews = await Promise.all(
      reviews.map(async (review: any) => {
        const analysis = await analyzeReview(review);
        return {
          business_name: review.business_name || '',
          rating: review.rating || 0,
          review_text: review.snippet || '',
          review_date: review.date || '',
          reviewer_name: review.author_title || '',
          location: location || '',
          keyword,
          ...analysis
        };
      })
    );

    // Store in Supabase
    const { error } = await supabase
      .from('business_reviews')
      .insert(analyzedReviews);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, reviews: analyzedReviews }),
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
