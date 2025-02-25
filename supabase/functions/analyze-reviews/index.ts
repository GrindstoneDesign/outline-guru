
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

async function searchBusinesses(keyword: string, location?: string) {
  if (!serpApiKey) {
    throw new Error('SERP_API_KEY is not configured');
  }

  console.log(`Searching for businesses with keyword: ${keyword} in ${location || 'any location'}`);
  
  const searchQuery = location ? `${keyword} in ${location}` : keyword;
  const params = new URLSearchParams({
    api_key: serpApiKey,
    engine: 'google_maps',
    q: searchQuery,
    type: 'search',
    hl: 'en'
  });

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('SerpAPI search error:', data);
      throw new Error(`SerpAPI search request failed: ${data.error || 'Unknown error'}`);
    }

    if (!data.local_results || !data.local_results.length) {
      console.log('No businesses found:', data);
      return [];
    }

    console.log(`Found ${data.local_results.length} businesses`);
    return data.local_results;
  } catch (error) {
    console.error('Error searching businesses:', error);
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
    sort: 'newest',
    hl: 'en'
  });

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('SerpAPI Reviews error:', data);
      throw new Error(`SerpAPI Reviews request failed: ${data.error || 'Unknown error'}`);
    }

    if (!data.reviews) {
      console.log('No reviews found:', data);
      return { reviews: [], placeInfo: data.place_info || {} };
    }

    console.log(`Found ${data.reviews.length} reviews`);
    return {
      reviews: data.reviews,
      placeInfo: data.place_info || {}
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

async function analyzeReview(review: any, businessInfo: any) {
  if (!openAIApiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const prompt = `
    Analyze this business review and provide:
    1. Main Topic (one short phrase)
    2. Category (exactly one of: motivation, value, or anxiety)
    3. Message Type (exactly one of: Pain Point, Purchase Prompt, Feature Request, or Praise)
    4. Key Feedback Location (quote the specific part that contains the main feedback)

    Business Name: ${businessInfo.name || 'Unknown'}
    Review: "${review.snippet || review.text}"

    Respond with ONLY a JSON object in this format:
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
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert at analyzing customer reviews. Always respond with ONLY a raw JSON object, no markdown formatting or explanation.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3 // Lower temperature for more consistent outputs
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API request failed: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Raw OpenAI response:', data.choices[0].message.content);
    
    try {
      // Attempt to parse the response, cleaning up any markdown formatting if present
      const cleanedContent = data.choices[0].message.content
        .replace(/```json\n?/, '')
        .replace(/```\n?/, '')
        .trim();
      return JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw content:', data.choices[0].message.content);
      throw new Error('Failed to parse OpenAI response');
    }
  } catch (error) {
    console.error('Error analyzing review:', error);
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

    // First search for businesses
    const businesses = await searchBusinesses(keyword, location);
    if (businesses.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          reviews: [],
          message: 'No businesses found for the given criteria' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze reviews for each business
    const allReviews = [];
    for (const business of businesses.slice(0, 3)) { // Limit to top 3 businesses
      console.log(`Processing business: ${business.title}`);
      
      if (!business.place_id) {
        console.log(`No place_id found for business: ${business.title}`);
        continue;
      }

      // Fetch reviews for this business
      const { reviews, placeInfo } = await fetchReviews(business.place_id);
      
      // Analyze each review
      for (const review of reviews.slice(0, 5)) { // Limit to 5 most recent reviews per business
        try {
          const analysis = await analyzeReview(review, placeInfo);
          allReviews.push({
            business_name: placeInfo.name || business.title,
            business_location: placeInfo.address || business.address,
            rating: review.rating,
            review_text: review.snippet || review.text,
            review_date: review.date ? new Date(review.date).toISOString() : null,
            reviewer_name: review.user?.name,
            keyword,
            ...analysis,
            message_type: analysis.messageType,
            competitor_url: placeInfo.website || business.website,
            review_source: 'Google',
            source_link: null, // Could add review link if available
            sentiment_analysis: null, // Could add sentiment analysis later
            created_at: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error analyzing review for ${business.title}:`, error);
        }
      }
    }

    console.log(`Successfully analyzed ${allReviews.length} reviews`);

    // Store reviews in database
    if (allReviews.length > 0) {
      const { error: insertError } = await supabase
        .from('business_reviews')
        .insert(allReviews);

      if (insertError) {
        console.error('Error inserting reviews:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reviews: allReviews,
        message: `Successfully analyzed ${allReviews.length} reviews` 
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

