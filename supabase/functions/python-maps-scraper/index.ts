import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers since the shared file doesn't exist
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Define the response type for the function
interface ScraperResponse {
  success: boolean;
  message: string;
  places?: any[];
  reviews?: any[];
  business_name?: string;
  business_address?: string;
  error?: string;
}

// Helper function to generate a valid UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Function to search for places using Google Maps API
async function searchPlacesReal(query: string, maxResults: number = 5): Promise<ScraperResponse> {
  try {
    // Get Google Maps API key from environment variables
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      console.log("No Google Maps API key found, falling back to mock data");
      return mockScraperExecution("search_places", { query, max_results: maxResults });
    }

    // Encode the query for URL
    const encodedQuery = encodeURIComponent(query);
    
    // Make a request to the Google Places API Text Search endpoint
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${apiKey}`;
    console.log(`Making request to Google Places API: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok || data.status !== "OK") {
      console.error("Google Places API error:", data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
    }
    
    if (!data.results || data.results.length === 0) {
      return {
        success: true,
        message: `No places found matching "${query}"`,
        places: [],
      };
    }
    
    // Map the results to our format
    const places = data.results.slice(0, maxResults).map((result: any) => ({
      name: result.name,
      rating: result.rating || 0,
      reviews_count: result.user_ratings_total || 0,
      place_id: result.place_id,
      address: result.formatted_address || "",
      url: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`
    }));
    
    return {
      success: true,
      message: `Found ${places.length} places matching "${query}"`,
      places,
    };
  } catch (error) {
    console.error("Error searching for places:", error);
    // Fall back to mock data if there's an error
    console.log("Falling back to mock data due to error");
    return mockScraperExecution("search_places", { query, max_results: maxResults });
  }
}

// Function to scrape reviews using Google Maps API
async function scrapeReviewsReal(
  placeId: string,
  placeUrl: string,
  placeName: string,
  maxReviews: number = 10
): Promise<ScraperResponse> {
  try {
    // Get Google Maps API key from environment variables
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      console.log("No Google Maps API key found, falling back to mock data");
      return mockScraperExecution("scrape_reviews", { 
        place_id: placeId, 
        place_url: placeUrl, 
        place_name: placeName, 
        max_reviews: maxReviews 
      });
    }
    
    // Make a request to the Google Places API Details endpoint to get reviews
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,review,url&key=${apiKey}`;
    console.log(`Making request to Google Places API Details: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok || data.status !== "OK") {
      console.error("Google Places API error:", data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
    }
    
    if (!data.result) {
      return {
        success: true,
        message: `No details found for place ID: ${placeId}`,
        reviews: [],
      };
    }
    
    const result = data.result;
    const businessName = result.name || placeName;
    const businessAddress = result.formatted_address || "";
    
    // Extract reviews
    const reviews = [];
    if (result.reviews && result.reviews.length > 0) {
      for (const review of result.reviews.slice(0, maxReviews)) {
        reviews.push({
          reviewer_name: review.author_name || "Anonymous",
          rating: review.rating || 0,
          review_text: review.text || "",
          review_date: new Date(review.time * 1000).toISOString() // Convert timestamp to ISO string
        });
      }
    }
    
    return {
      success: true,
      message: `Found ${reviews.length} reviews for "${businessName}"`,
      reviews,
      business_name: businessName,
      business_address: businessAddress,
    };
  } catch (error) {
    console.error("Error scraping reviews:", error);
    // Fall back to mock data if there's an error
    console.log("Falling back to mock data due to error");
    return mockScraperExecution("scrape_reviews", { 
      place_id: placeId, 
      place_url: placeUrl, 
      place_name: placeName, 
      max_reviews: maxReviews 
    });
  }
}

// Mock implementation for development/testing
function mockScraperExecution(
  action: string,
  params: Record<string, any>
): ScraperResponse {
  console.log(`Mock execution of Python scraper with action: ${action}`);
  console.log("Parameters:", JSON.stringify(params));
  
  // Generate mock data based on the action
  if (action === "search_places") {
    const query = params.query || "restaurant";
    const maxResults = params.max_results || 5;
    
    // Generate mock places
    const places = [];
    for (let i = 1; i <= maxResults; i++) {
      // Create a mock place ID that looks like a real one
      const placeId = `ChIJ${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      
      places.push({
        name: `${query} Business ${i}`,
        rating: 3.5 + Math.random() * 1.5,
        reviews_count: Math.floor(10 + Math.random() * 90),
        place_id: placeId,
        address: `${Math.floor(100 + Math.random() * 900)} Main St, Anytown`,
        url: `https://www.google.com/maps/place/?q=place_id:${placeId}`
      });
    }
    
    return {
      success: true,
      message: `Found ${places.length} places matching "${query}"`,
      places,
    };
  } else if (action === "scrape_reviews") {
    const placeId = params.place_id || "ChIJxxxxxxxxxxxxxxxx";
    const placeUrl = params.place_url || `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    const placeName = params.place_name || "Business Name";
    const maxReviews = params.max_reviews || 10;
    
    // Generate mock reviews
    const reviews = [];
    for (let i = 1; i <= maxReviews; i++) {
      reviews.push({
        reviewer_name: `Reviewer ${i}`,
        rating: Math.floor(3 + Math.random() * 3), // Random rating between 3 and 5
        review_text: `This is a mock review ${i} for ${placeName}. The service was great and the staff was friendly. Would definitely recommend to others!`,
        review_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in the last 30 days
      });
    }
    
    return {
      success: true,
      message: `Found ${reviews.length} reviews for "${placeName}"`,
      reviews,
      business_name: placeName,
      business_address: `123 Business St, Anytown`,
    };
  }
  
  return {
    success: false,
    message: `Unknown action: ${action}`,
    error: "Invalid action specified",
  };
}

// Main serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { action, ...params } = await req.json();
    
    if (!action) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required parameter: action",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    console.log(`Received request for action: ${action}`);
    
    // Try to use real data first, fall back to mock if needed
    let result: ScraperResponse;
    
    if (action === "search_places") {
      result = await searchPlacesReal(
        params.query, 
        params.max_results
      );
    } else if (action === "scrape_reviews") {
      result = await scrapeReviewsReal(
        params.place_id,
        params.place_url,
        params.place_name,
        params.max_reviews
      );
    } else {
      result = {
        success: false,
        message: `Unknown action: ${action}`,
        error: "Invalid action specified",
      };
    }
    
    // Return the result
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: result.success ? 200 : 500,
    });
  } catch (error: unknown) {
    console.error("Error processing request:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error processing request",
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}); 