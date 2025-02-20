
export async function fetchDuckDuckGoResults(keyword: string) {
  const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(keyword)}&format=json`);
  const data = await response.json();
  
  return data.RelatedTopics
    .filter((topic: any) => topic.Text && topic.FirstURL)
    .slice(0, 5)
    .map((topic: any) => ({
      title: topic.Text.split(' - ')[0],
      snippet: topic.Text,
      link: topic.FirstURL
    }));
}

export async function fetchGoogleResults(keyword: string, serpApiKey: string) {
  const searchUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&api_key=${serpApiKey}`;
  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();
  return searchData.organic_results?.slice(0, 5) || [];
}
