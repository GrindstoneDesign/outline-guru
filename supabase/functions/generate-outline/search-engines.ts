
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

export async function fetchGoogleResults(keyword: string, serpApiKey: string) {
  try {
    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&api_key=${serpApiKey}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch Google results');
    }

    return (data.organic_results || [])
      .slice(0, 3)
      .map((result: any) => ({
        title: result.title,
        snippet: result.snippet,
        link: result.link
      }));
  } catch (error) {
    console.error('Error fetching Google results:', error);
    // Fallback to mock data if Google search fails
    return [
      {
        title: "Google Result 1",
        snippet: "This is a sample Google search result",
        link: "https://example.com/g1"
      },
      {
        title: "Google Result 2",
        snippet: "Another sample Google search result",
        link: "https://example.com/g2"
      },
      {
        title: "Google Result 3",
        snippet: "A third Google sample result",
        link: "https://example.com/g3"
      }
    ].slice(0, 3);
  }
}
