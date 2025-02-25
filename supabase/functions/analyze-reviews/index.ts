
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

async function findPlaceId(keyword: string, location: string) {
  if (!serpApiKey) {
    throw new Error('SERP_API_KEY is not configured');
  }

  console.log(`Finding place_id for: ${keyword} in ${location}`);
  
  const params = new URLSearchParams({
    api_key: serpApiKey,
    engine: 'google_maps',
    q: `${keyword} ${location}`,
    type: 'search',
    hl: 'en'
  });

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('SerpAPI Places error:', data);
      throw new Error(`SerpAPI Places request failed: ${data.error || 'Unknown error'}`);
    }

    if (!data.local_results || !data.local_results[0]) {
      console.log('No places found in SerpAPI response:', data);
      return null;
    }

    const placeId = data.local_results[0].place_id;
    console.log(`Found place_id: ${placeId}`);
    return placeId;
  } catch (error) {
    console.error('Error finding place_id:', error);
    throw error;
  }
}

async function fetchReviews(placeId: string) {
  if (!serpApiKey) {
    throw new Error('SERP_API_KEY is not configured');
  }

  console.log(`Fetching reviews for place_id: ${placeId}`);
  
  const params = new URLSearchParams({
    api_key: serpApiKey,
    engine: 'google_maps_reviews',
    place_id: placeId,
    sort_by: 'newestFirst',
    num: '10',  // Fetch top 10 reviews
    hl: 'en'
  });

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('SerpAPI Reviews error:', data);
      throw new Error(`SerpAPI Reviews request failed: ${data.error || 'Unknown error'}`);
    }

    if (!data.reviews || !Array.isArray(data.reviews)) {
      console.log('No reviews found in SerpAPI response:', data);
      return [];
    }

    console.log(`Found ${data.reviews.length} reviews from SerpAPI`);
    return {
      reviews: data.reviews,
      placeInfo: data.place_info || {}
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

async function analyzeReview(review: any, businessName: string) {
  if (!openAIApiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const prompt = `
    Analyze this business review and provide:
    1. Main Topic/Theme (one short phrase)
    2. Category (exactly one of: motivation, value, or anxiety)
    3. Message Type (exactly one of: Pain Point, Purchase Prompt, Feature Request, or Praise)
    4. Key Feedback Location (quote the specific part of the review containing the main feedback)

    Review: "${review.snippet}"

    Format response as JSON like:
    {
      "topic": "string",
      "category": "motivation|value|anxiety",
      "messageType": "Pain Point|Purchase Prompt|Feature Request|Praise",
      "feedbackLocation": "string"
    }
  `;

  try {
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

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API request failed: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI analysis completed successfully');
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing review with OpenAI:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, location } = await req.json();
    console.log(`Starting review analysis for: ${keyword} in ${location || 'any location'}`);

    if (!keyword) {
      throw new Error('Keyword is required');
    }

    // First find the place_id
    const placeId = await findPlaceId(keyword, location || '');
    if (!placeId) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          reviews: [],
          message: 'No business found for the given criteria' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Then fetch reviews using the place_id
    const { reviews, placeInfo } = await fetchReviews(placeId);
    console.log(`Found ${reviews.length} reviews to analyze`);

    if (reviews.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          reviews: [],
          message: 'No reviews found for the business' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze each review with ChatGPT
    const analyzedReviews = await Promise.all(
      reviews.map(async (review: any) => {
        try {
          console.log(`Analyzing review for business: ${placeInfo.name || 'Unknown'}`);
          const analysis = await analyzeReview(review, placeInfo.name || '');
          return {
            business_name: placeInfo.name || '',
            business_location: placeInfo.address || '',
            rating: review.rating || null,
            review_text: review.snippet || '',
            review_date: review.date || null,
            reviewer_name: review.user?.name || '',
            keyword,
            ...analysis,
            message_type: analysis.messageType,
            competitor_url: placeInfo.website || null,
          };
        } catch (error) {
          console.error('Error analyzing individual review:', error);
          return null;
        }
      })
    );

    // Filter out failed analyses
    const validReviews = analyzedReviews.filter(review => review !== null);
    console.log(`Successfully analyzed ${validReviews.length} reviews`);

    // Store in Supabase
    if (validReviews.length > 0) {
      const { error: insertError } = await supabase
        .from('business_reviews')
        .insert(validReviews);

      if (insertError) {
        console.error('Error inserting reviews into database:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reviews: validReviews,
        message: `Successfully analyzed ${validReviews.length} reviews`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-reviews function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        reviews: [] 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
