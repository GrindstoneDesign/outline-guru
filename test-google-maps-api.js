// Simple test script to verify Google Maps API integration

// For Node.js versions that don't have fetch built-in
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Replace with your Google Maps API key
const API_KEY = "YOUR_API_KEY_HERE";

// Function to search for places
async function searchPlaces(query) {
  try {
    console.log(`Searching for places matching: "${query}"`);
    
    // Encode the query for URL
    const encodedQuery = encodeURIComponent(query);
    
    // Make a request to the Google Places API Text Search endpoint
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${API_KEY}`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok || data.status !== "OK") {
      console.error("Google Places API error:", data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
    }
    
    if (!data.results || data.results.length === 0) {
      console.log(`No places found matching "${query}"`);
      return [];
    }
    
    // Map the results to a simpler format
    const places = data.results.map(result => ({
      name: result.name,
      rating: result.rating || 0,
      reviews_count: result.user_ratings_total || 0,
      place_id: result.place_id,
      address: result.formatted_address || "",
      url: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`
    }));
    
    console.log(`Found ${places.length} places matching "${query}"`);
    console.log(places);
    
    return places;
  } catch (error) {
    console.error("Error searching for places:", error);
    throw error;
  }
}

// Function to get reviews for a place
async function getReviews(placeId) {
  try {
    console.log(`Getting reviews for place ID: ${placeId}`);
    
    // Make a request to the Google Places API Details endpoint
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,review,url&key=${API_KEY}`;
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok || data.status !== "OK") {
      console.error("Google Places API error:", data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
    }
    
    if (!data.result) {
      console.log(`No details found for place ID: ${placeId}`);
      return { reviews: [] };
    }
    
    const result = data.result;
    const businessName = result.name;
    const businessAddress = result.formatted_address || "";
    
    // Extract reviews
    const reviews = [];
    if (result.reviews && result.reviews.length > 0) {
      for (const review of result.reviews) {
        reviews.push({
          reviewer_name: review.author_name || "Anonymous",
          rating: review.rating || 0,
          review_text: review.text || "",
          review_date: new Date(review.time * 1000).toISOString() // Convert timestamp to ISO string
        });
      }
    }
    
    console.log(`Found ${reviews.length} reviews for "${businessName}"`);
    console.log(reviews);
    
    return {
      business_name: businessName,
      business_address: businessAddress,
      reviews
    };
  } catch (error) {
    console.error("Error getting reviews:", error);
    throw error;
  }
}

// Main function to run the test
async function runTest() {
  try {
    // Check if API key is set
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
      console.error("Please set your Google Maps API key in the script");
      return;
    }
    
    // Search for places
    const query = "restaurants in New York";
    const places = await searchPlaces(query);
    
    if (places.length === 0) {
      console.log("No places found to test reviews");
      return;
    }
    
    // Get reviews for the first place
    const firstPlace = places[0];
    console.log(`\nGetting reviews for: ${firstPlace.name} (${firstPlace.place_id})`);
    
    const reviewsData = await getReviews(firstPlace.place_id);
    
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
runTest(); 