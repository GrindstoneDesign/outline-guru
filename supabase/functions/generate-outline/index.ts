
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const serpApiKey = Deno.env.get('SERP_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchDuckDuckGoResults(keyword: string) {
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

async function fetchGoogleResults(keyword: string) {
  const searchUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&api_key=${serpApiKey}`;
  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();
  return searchData.organic_results?.slice(0, 5) || [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, searchEngine } = await req.json();

    const organicResults = searchEngine === 'google' 
      ? await fetchGoogleResults(keyword)
      : await fetchDuckDuckGoResults(keyword);

    const competitorContent = organicResults
      .map(result => `${result.title}\n${result.snippet}`)
      .join('\n\n');

    const individualAnalysesPromise = organicResults.map(async (result, index) => {
      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `You are an expert SEO content strategist analyzing a single competitor's webpage. Create a detailed breakdown of their content strategy, capturing every specific detail:

=== SECTION-BY-SECTION ANALYSIS ===

For each distinct section on the page, document:

----------------------------------------
SECTION TYPE: [e.g., Hero, Benefits, FAQ, etc.]

EXACT HEADING: [Copy the full heading text]
HEADING LEVEL: [H1, H2, H3, etc.]

CONTENT SPECIFICS:
- Main Message: [Copy key phrases/claims]
- Exact Benefits Listed: [Copy all benefits]
- Statistics Used: [Note specific numbers]
- Geographic Terms: [List location mentions]
- Trust Signals: [List credentials, years, certifications]

PRESENTATION FORMAT:
- Layout Type: [List, cards, paragraphs, etc.]
- Visual Elements: [Count and describe images/videos]
- Interactive Elements: [Forms, calculators, etc.]
- Call-to-Action Text: [Copy exact CTA wording]

SECTION-SPECIFIC DETAILS:

If Benefits Section:
- List each benefit verbatim
- Note any supporting evidence
- Capture specific numbers/claims

If FAQ Section:
- Copy all questions exactly
- Note answer length/format
- List topics covered

If Testimonials:
- Count total testimonials
- Copy key quotes
- Note attribution methods

If Pricing Section:
- List exact prices shown
- Note how costs are broken down
- Copy promotional offers
----------------------------------------

=== TECHNICAL ELEMENTS ===

META INFORMATION:
- Title: [Exact meta title]
- Description: [Exact meta description]
- H1: [Exact H1 text]
- URL Structure: [Note URL format]

KEYWORD USAGE:
- Primary: [List exact usage]
- Secondary: [List exact usage]
- Local Terms: [List geographic terms]

TRUST ELEMENTS:
- Years in Business: [Exact number]
- Certifications: [List all]
- Awards: [List any mentioned]
- Professional Memberships: [List all]

CONVERSION ELEMENTS:
- Primary CTA: [Exact text]
- Secondary CTAs: [List all]
- Form Fields: [List required information]
- Phone Numbers: [Note placement]

LOCAL SEO:
- Service Areas: [List all mentioned]
- Community References: [List local elements]
- Geographic Terms: [List all variations]`
            },
            {
              role: 'user',
              content: `Analyze this content from competitor ${index + 1}:\n\n${result.title}\n${result.snippet}`
            }
          ],
        }),
      });

      const analysisData = await analysisResponse.json();
      return analysisData.choices[0].message.content;
    });

    const individualAnalyses = await Promise.all(individualAnalysesPromise);
    
    const masterStrategyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an expert SEO strategist creating a master content plan based on multiple competitor analyses. Synthesize the individual analyses into actionable recommendations:

=== CONTENT STRATEGY SYNTHESIS ===

1. SECTION-BY-SECTION RECOMMENDATIONS
[For each major section type found across competitors:]

----------------------------------------
SECTION TYPE: [e.g., Hero Section]

COMPETITIVE ANALYSIS:
- Usage Rate: [How many competitors included this]
- Common Approaches: [List specific approaches used]
- Heading Patterns: [Note common patterns]

SPECIFIC ELEMENTS TO INCLUDE:
- Must-Have Components: [List elements used by most competitors]
- Key Messages: [List common themes/claims]
- Trust Signals: [List commonly used proof elements]

CONTENT REQUIREMENTS:
- Topics to Cover: [List specific topics from competitor analysis]
- Claims to Make: [List effective claims found]
- Evidence to Provide: [List proof points used]

RECOMMENDED FORMAT:
- Optimal Structure: [Based on competitor success]
- Visual Elements: [List recommended media]
- CTA Approach: [Note most effective CTA patterns]
----------------------------------------

2. COMPETITIVE CONTENT GAPS
- List specific topics competitors missed
- Note underutilized content types
- Identify opportunity areas

3. EFFECTIVE PATTERNS
- List successful content approaches
- Note common trust-building methods
- Identify winning CTA strategies

4. LOCAL SEO INSIGHTS
- List effective geographic terms
- Note service area presentation
- Identify local trust-building tactics

5. TECHNICAL SPECIFICATIONS
- Recommended word count [based on competitor average]
- Meta information patterns
- Structure and formatting guidelines

Remember:
- Include specific examples from competitors
- Note exact language that works well
- Provide concrete recommendations`
          },
          {
            role: 'user',
            content: `Create a comprehensive content strategy for "${keyword}" based on these competitor analyses:\n\n${individualAnalyses.join('\n\n=== NEXT COMPETITOR ===\n\n')}`
          }
        ],
      }),
    });

    const masterStrategyData = await masterStrategyResponse.json();
    const outline = masterStrategyData.choices[0].message.content;

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
