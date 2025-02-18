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
  
  // Format DuckDuckGo results to match our expected structure
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

    // Fetch search results based on selected engine
    const organicResults = searchEngine === 'google' 
      ? await fetchGoogleResults(keyword)
      : await fetchDuckDuckGoResults(keyword);

    const competitorContent = organicResults
      .map(result => `${result.title}\n${result.snippet}`)
      .join('\n\n');

    // First, analyze each competitor's content
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
              content: `Act as an expert SEO content strategist analyzing competitor content. Break down this webpage content into a structured analysis following these exact formatting rules:

=== CONTENT SECTION ANALYSIS ===

Format each section exactly like this, with clear spacing between sections:

----------------------------------------
SECTION TYPE: [Choose the most specific type from this list]
- Hero/Above Fold
- Value Proposition
- Feature Showcase
- Benefits List
- Comparison Table
- Product Specifications
- How-To Guide
- Tutorial Steps
- Case Study
- Social Proof/Testimonials
- Trust Indicators
- FAQ Section
- Email Capture Form
- Call-to-Action (CTA)
- Video Content
- Interactive Tool
- Calculator
- Pricing Table
- Navigation Menu
- Related Products
- Blog Section
- Category List
- Contact Information
- About Section
- Image Gallery

HEADING USED: [Copy the exact heading text used]

SECTION PURPOSE:
[2-3 sentences explaining what this section aims to achieve]

CONTENT STRUCTURE:
- Type: [List, Cards, Paragraphs, Table, Grid, etc.]
- Layout: [How the content is arranged]
- Special Elements: [Any unique features, tools, or design elements]

KEY POINTS COVERED:
- [Main point 1]
- [Main point 2]
- [Main point 3]
[Add more points as needed]

SECTION EFFECTIVENESS:
- Strengths: [What works well]
- Gaps: [What's missing or could be improved]
----------------------------------------

=== PAGE ANALYSIS SUMMARY ===

CONTENT FLOW:
- [How sections are ordered]
- [Why this order makes sense]
- [Suggestions for improvement]

UNIQUE APPROACHES:
- [List distinctive content strategies]
- [Note innovative presentation methods]
- [Highlight special features]

CONTENT GAPS:
- [Missing content types]
- [Unexplored topics]
- [Missed opportunities]

COMPETITIVE EDGE:
- [What makes this content effective]
- [Where it falls short]
- [How to outperform it]`
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
    
    // Then, generate the master content strategy
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
            content: `As an expert SEO content strategist, create a comprehensive content strategy based on these 5 competitor analyses. Follow this exact structure:

=== STRATEGIC CONTENT BRIEF ===

1. CONTENT STRATEGY OVERVIEW
----------------------------------------
REQUIRED SECTION TYPES:
[List all essential content sections found across competitors, ordered by frequency of appearance]

CRITICAL TOPICS:
[List must-cover topics found in competitor content]

CONTENT GAPS & OPPORTUNITIES:
[List topics/approaches missing from competitor content]

STRUCTURAL RECOMMENDATIONS:
[List best practices for content presentation based on competitor analysis]
----------------------------------------

2. DETAILED CONTENT PLAN
[For each recommended section, format exactly like this:]

----------------------------------------
SECTION TYPE: [Type from list above]

STRATEGIC PLACEMENT: [Where in the content flow]

PURPOSE:
[2-3 sentences on why this section is needed]

CONTENT REQUIREMENTS:
- [Required element 1]
- [Required element 2]
- [Required element 3]

PRESENTATION RECOMMENDATIONS:
- Structure: [How to format]
- Elements: [What to include]
- Features: [Special features needed]

COMPETITIVE ADVANTAGE:
- [How to outperform competitors 1]
- [How to outperform competitors 2]
- [How to outperform competitors 3]
----------------------------------------

3. TECHNICAL REQUIREMENTS
----------------------------------------
CONTENT LENGTH:
- Overall Word Count: [Range based on competitor analysis]
- Section-by-Section Breakdown: [List each section's target length]

MUST-HAVE ELEMENTS:
- [Essential feature 1]
- [Essential feature 2]
- [Essential feature 3]

UNIQUE VALUE ADDS:
- [Differentiator 1]
- [Differentiator 2]
- [Differentiator 3]
----------------------------------------

4. BRIEF DETAILS

KEYWORD STRATEGY:
- Primary Keyword: [Most prominent keyword from competitor analysis]
- Secondary Keywords: [List 5-7 relevant keywords found across competitor content]

SEARCH INTENT ANALYSIS:
- Primary Intent: [Analyze content to determine if informational/commercial/transactional]
- User Goals: [List 3 main things users want to accomplish]
- Content Type Match: [What type of content best serves this intent]

AUDIENCE INSIGHTS:
- Primary Audience: [Based on content tone and complexity]
- Knowledge Level: [Beginner/Intermediate/Advanced]
- Pain Points: [List 3-4 main problems addressed]

META INFORMATION:
- Meta Title: [60 characters max, include primary keyword]
- Meta Description: [160 characters max, compelling call to action]
- H1: [Include primary keyword naturally]
- URL Structure: [Recommend SEO-friendly URL]

CONTENT REQUIREMENTS:
- Schema Markup: [Recommend based on content type]
- Word Count: [Range based on competitor average]
- Readability Level: [Recommend based on audience]

ENGAGEMENT ELEMENTS:
- Primary CTA: [Main action you want users to take]
- Secondary CTAs: [2-3 additional conversion points]
- Digestibility Elements: [List needed elements like:
  - Tables
  - Lists
  - Charts
  - Images
  - Videos
  - Comparison matrices]

INTERNAL LINKING:
- Outlinks: [Suggest 3-5 relevant topics to link to]
- Link Placement: [Recommend natural linking points]

COMPETITIVE INSIGHTS:
- Top Competitors: [List URLs of 3 strongest competitors]
- Content Gaps: [Identify missing elements in competitor content]
- Unique Angles: [Suggest ways to differentiate]`
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
