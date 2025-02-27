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

// Helper function to generate a valid UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Add type definitions after the supabase client initialization
interface BusinessResult {
  title: string;
  link: string;
  snippet?: string | null;
  displayed_link?: string;
  price?: string;
  rating?: number;
  reviews?: number;
}

interface BusinessData {
  title: string;
  link: string;
  snippet?: string;
  place_id: string;
  address: string;
  rating: number | null;
  reviews_count: number | null;
  description: string;
  displayed_link?: string;
}

interface Review {
  text: string;
  rating: number | null;
  date: string | null;
  user: { name: string };
  snippet?: string;
}

interface PlaceInfo {
  name: string;
  address: string;
  website: string;
}

interface ReviewAnalysis {
  topic: string;
  category: 'motivation' | 'value' | 'anxiety';
  messageType: 'Pain Point' | 'Purchase Prompt' | 'Feature Request' | 'Praise';
  feedbackLocation: string;
}

async function searchBusinesses(keyword: string, location?: string) {
  if (!serpApiKey) {
    throw new Error('SERP_API_KEY is not configured');
  }

  console.log(`Searching for businesses with keyword: ${keyword} in ${location || 'any location'}`);
  
  const searchQuery = location 
    ? `${keyword} reviews in ${location}` 
    : `${keyword} reviews`;
  
  console.log(`Search query: "${searchQuery}"`);
  
  const params = new URLSearchParams({
    api_key: serpApiKey,
    engine: 'google_maps',
    q: searchQuery,
    type: 'search',
    ll: '@0,0,15z',
    num: '10',
    hl: 'en',
    gl: 'us'
  });

  if (location) {
    params.set('near', location);
  }

  try {
    const url = `https://serpapi.com/search.json?${params}`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('SerpAPI search error:', data);
      throw new Error(`SerpAPI search request failed: ${data.error || 'Unknown error'}`);
    }

    if (data.error) {
      console.error('SerpAPI returned an error:', data.error);
      throw new Error(`SerpAPI error: ${data.error}`);
    }

    console.log('SerpAPI response structure:', Object.keys(data));
    
    if (data.local_results && data.local_results.length > 0) {
      console.log(`Found ${data.local_results.length} local results`);
      
      console.log('Sample local result structure:', JSON.stringify(data.local_results[0], null, 2));
      
      return data.local_results.map((result: any) => ({
        title: result.title,
        link: result.website || result.links?.website || `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
        snippet: result.description || result.snippet,
        place_id: result.place_id,
        address: result.address,
        rating: result.rating,
        reviews_count: result.reviews,
        description: result.description || result.snippet
      }));
    }
    
    if (data.organic_results && data.organic_results.length > 0) {
      console.log(`Found ${data.organic_results.length} organic results, but no place IDs`);
      
      return data.organic_results.map((result: BusinessResult) => {
        let place_id = null;
        if (result.link) {
          const placeIdMatch = result.link.match(/[?&]place_id=([^&]+)/);
          if (placeIdMatch && placeIdMatch[1]) {
            place_id = placeIdMatch[1];
          }
        }
        
        return {
          title: result.title,
          link: result.link,
          snippet: result.snippet,
          place_id: place_id || result.link,
          address: result.displayed_link || '',
          rating: extractRating(result.snippet),
          reviews_count: extractReviewCount(result.snippet),
          description: result.snippet
        };
      });
    }
    
    console.log('No local or organic results found. Full response:', JSON.stringify(data, null, 2));
    return [];
  } catch (error) {
    console.error('Error searching businesses:', error);
    throw error;
  }
}

function extractRating(snippet: string | null | undefined): number | null {
  if (!snippet) return null;
  
  const ratingMatch = snippet.match(/(\d+(\.\d+)?)\s*\/\s*5/i) || 
                      snippet.match(/(\d+(\.\d+)?)\s*out of\s*5/i) ||
                      snippet.match(/(\d+(\.\d+)?)\s*stars?/i);
  
  if (ratingMatch) {
    return parseFloat(ratingMatch[1]);
  }
  
  return null;
}

function extractReviewCount(snippet: string | null | undefined): number | null {
  if (!snippet) return null;
  
  const reviewMatch = snippet.match(/\((\d+)\s*reviews?\)/i) || 
                      snippet.match(/(\d+)\s*reviews?/i);
  
  if (reviewMatch) {
    return parseInt(reviewMatch[1], 10);
  }
  
  return null;
}

// Change from regular function to async since we'll be fetching data
async function fetchReviews(businessData: BusinessData): Promise<{ reviews: Review[], placeInfo: PlaceInfo }> {
  if (!serpApiKey) {
    throw new Error('SERP_API_KEY is not configured');
  }

  console.log(`Processing reviews for business: ${businessData.title}`);
  console.log('Business data:', JSON.stringify(businessData, null, 2));
  
  // Check if we have a place_id to use for fetching reviews
  if (businessData.place_id && businessData.place_id.startsWith('ChIJ')) {
    console.log(`Using place_id to fetch reviews: ${businessData.place_id}`);
    
    // Construct parameters for the Google Maps Reviews API
    const params = new URLSearchParams({
      api_key: serpApiKey,
      engine: 'google_maps_reviews',
      place_id: businessData.place_id,
      hl: 'en',
      gl: 'us'
    });
    
    try {
      const url = `https://serpapi.com/search.json?${params}`;
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok || data.error) {
        console.error('SerpAPI reviews error:', data.error || 'Unknown error');
        throw new Error(`SerpAPI reviews request failed: ${data.error || 'Unknown error'}`);
      }
      
      console.log('SerpAPI reviews response structure:', Object.keys(data));
      
      // Extract reviews from the response
      if (data.reviews && data.reviews.length > 0) {
        console.log(`Found ${data.reviews.length} reviews for ${businessData.title}`);
        
        const reviews = data.reviews.map((review: any) => ({
          text: review.snippet || review.text || '',
          rating: review.rating,
          date: review.date,
          user: { name: review.user?.name || 'Anonymous' },
          snippet: review.snippet || review.text || ''
        }));
        
        return {
          reviews,
          placeInfo: {
            name: data.place_info?.title || businessData.title,
            address: data.place_info?.address || businessData.address,
            website: data.place_info?.website || businessData.link
          }
        };
      } else {
        console.log(`No reviews found for place_id: ${businessData.place_id}`);
      }
    } catch (error) {
      console.error(`Error fetching reviews for place_id ${businessData.place_id}:`, error);
      // Fall through to use snippet as a fallback
    }
  }
  
  // Fallback: Check if we have a snippet or description to use as review content
  if (businessData.snippet || businessData.description) {
    const reviewText = businessData.snippet || businessData.description;
    console.log(`Using review from search result: "${reviewText}"`);
    
    // Try to extract a more focused review from the snippet if possible
    let extractedReview = reviewText;
    
    // Look for quoted text which often contains actual reviews
    const quotedMatch = reviewText.match(/"([^"]+)"/);
    if (quotedMatch && quotedMatch[1]) {
      extractedReview = quotedMatch[1];
      console.log(`Extracted quoted review: "${extractedReview}"`);
    }
    
    // Create a synthetic review from the extracted text
    const review: Review = {
      text: extractedReview,
      rating: businessData.rating || null,
      date: null,
      user: { name: 'Anonymous' }
    };
    
    return {
      reviews: [review],
      placeInfo: {
        name: businessData.title,
        address: businessData.address || businessData.displayed_link || '',
        website: businessData.link || ''
      }
    };
  }
  
  console.log('No review text found in search result');
  return { 
    reviews: [], 
    placeInfo: {
      name: businessData.title || 'Unknown',
      address: businessData.address || businessData.displayed_link || '',
      website: businessData.link || ''
    }
  };
}

async function analyzeReview(review: Review, businessInfo: PlaceInfo): Promise<ReviewAnalysis> {
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
        temperature: 0.3
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

    // Search for businesses using Google Maps
    const businesses = await searchBusinesses(keyword, location);
    if (businesses.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          reviews: [],
          message: 'No businesses found for the given criteria. Try a more specific keyword or different location.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${businesses.length} businesses, fetching reviews...`);

    const allReviews = [];
    const businessesWithoutReviews = [];
    
    // Process up to 5 businesses to avoid rate limits
    for (const business of businesses.slice(0, 5)) {
      console.log(`Processing business: ${business.title}`);
      
      // Fetch reviews using place_id if available
      const { reviews, placeInfo } = await fetchReviews(business);
      
      if (reviews.length === 0) {
        businessesWithoutReviews.push(business.title || placeInfo.name);
        continue;
      }
      
      console.log(`Processing ${reviews.length} reviews for ${business.title}`);
      
      // Process each review
      for (const review of reviews) {
        try {
          // Analyze the review content
          const analysis = await analyzeReview(review, placeInfo);
          
          // Create a review analysis object
          allReviews.push({
            id: generateUUID(), // Generate a UUID for the review
            business_name: placeInfo.name || business.title,
            business_location: placeInfo.address || business.address || '',
            rating: review.rating || business.rating,
            review_text: review.text,
            review_date: review.date ? new Date(review.date).toISOString() : null,
            reviewer_name: review.user?.name || 'Anonymous',
            keyword,
            topic: analysis.topic,
            category: analysis.category,
            message_type: analysis.messageType,
            feedback_location: analysis.feedbackLocation,
            review_source: 'Google Maps',
            source_link: business.link,
            sentiment_analysis: null, // We could add sentiment analysis in the future
            created_at: new Date().toISOString(),
            competitor_url: placeInfo.website || business.link
          });
        } catch (error) {
          console.error(`Error analyzing review for ${business.title}:`, error);
        }
      }
    }

    console.log(`Successfully analyzed ${allReviews.length} reviews`);

    // Insert reviews into the database if we have any
    if (allReviews.length > 0) {
      try {
        const { error: insertError } = await supabase
          .from('business_reviews')
          .insert(allReviews);

        if (insertError) {
          console.error('Error inserting reviews:', insertError);
          // Continue even if there's an error inserting
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue even if there's a database error
      }
    }

    // Prepare response message
    let message = `Successfully analyzed ${allReviews.length} reviews from ${businesses.length - businessesWithoutReviews.length} businesses`;
    if (allReviews.length === 0) {
      if (businessesWithoutReviews.length > 0) {
        message = `Found businesses (${businessesWithoutReviews.join(', ')}), but no reviews were available. This could be due to API limitations or because these businesses have no reviews.`;
      } else {
        message = 'No reviews found. Try adjusting your search terms or locations.';
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reviews: allReviews,
        message: message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-reviews function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
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

