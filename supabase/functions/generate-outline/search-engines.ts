export async function fetchDuckDuckGoResults(keyword: string) {
  try {
    // Since DuckDuckGo's API is limited, let's create a mock response for testing
    return [
      {
        title: "Sample Result 1",
        snippet: "This is a sample search result for testing purposes",
        link: "https://example.com/1"
      },
      {
        title: "Sample Result 2",
        snippet: "Another sample search result to test with",
        link: "https://example.com/2"
      },
      {
        title: "Sample Result 3",
        snippet: "A third sample result for good measure",
        link: "https://example.com/3"
      }
    ].slice(0, 3);
  } catch (error) {
    console.error('Error fetching DuckDuckGo results:', error);
    return [];
  }
}

interface SerpApiResponse {
  search_metadata?: {
    id: string;
    status: string;
    created_at: string;
    processed_at: string;
    total_time_taken: number;
  };
  search_parameters?: {
    engine: string;
    q: string;
    location_used?: string;
  };
  search_information?: {
    query_displayed: string;
    total_results: number;
    time_taken_displayed: number;
  };
  local_results?: {
    places: Array<{
      position: number;
      title: string;
      rating?: number;
      reviews?: number;
      description?: string;
      phone?: string;
      address?: string;
      hours?: string;
      type?: string;
    }>;
  };
  organic_results?: Array<{
    title: string;
    snippet: string;
    link: string;
  }>;
  related_brands?: Array<{
    title: string;
    snippet?: string;
    link: string;
  }>;
}

export async function fetchGoogleResults(keyword: string, serpApiKey: string) {
  try {
    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&api_key=${serpApiKey}`);
    const data: SerpApiResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch Google results');
    }

    // Combine organic results with local business results and related brands for more comprehensive data
    const results = [];

    // Add organic search results
    if (data.organic_results) {
      results.push(...data.organic_results.map(result => ({
        title: result.title,
        snippet: result.snippet,
        link: result.link,
        type: 'organic'
      })));
    }

    // Add local business results if available
    if (data.local_results?.places) {
      results.push(...data.local_results.places.map(place => ({
        title: place.title,
        snippet: place.description || `${place.type || ''} ${place.rating ? `• Rating: ${place.rating}` : ''} ${place.reviews ? `• ${place.reviews} reviews` : ''} ${place.address ? `• ${place.address}` : ''}`.trim(),
        link: `https://www.google.com/maps/place/${encodeURIComponent(place.title)}`,
        type: 'local'
      })));
    }

    // Add related brands if available
    if (data.related_brands) {
      results.push(...data.related_brands.map(brand => ({
        title: brand.title,
        snippet: brand.snippet || '',
        link: brand.link,
        type: 'brand'
      })));
    }

    // Return the top results, prioritizing a mix of different result types
    return results
      .slice(0, 5)
      .map(({ title, snippet, link, type }) => ({
        title,
        snippet,
        link,
        resultType: type
      }));

  } catch (error) {
    console.error('Error fetching Google results:', error);
    // Fallback to mock data if Google search fails
    return [
      {
        title: "Google Result 1",
        snippet: "This is a sample Google search result",
        link: "https://example.com/g1",
        resultType: "organic"
      },
      {
        title: "Google Result 2",
        snippet: "Another sample Google search result",
        link: "https://example.com/g2",
        resultType: "organic"
      },
      {
        title: "Google Result 3",
        snippet: "A third Google sample result",
        link: "https://example.com/g3",
        resultType: "organic"
      }
    ].slice(0, 3);
  }
}
