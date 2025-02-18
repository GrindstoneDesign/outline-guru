
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Features() {
  return (
    <div className="container mx-auto py-24 px-4 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Powerful Features That Streamline Your SEO Workflow</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          At SERPBriefs, we believe in simplicity. Our features are designed to reduce manual research and give you a head start on every new piece of content.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>One-Click SERP Fetch</CardTitle>
            <CardDescription>Save time on manual research</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              <li>Instantly pull the top results for your keyword from Google</li>
              <li>Skip manual research and copying links</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto-Scrape & Structure</CardTitle>
            <CardDescription>Organized content breakdowns</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              <li>Automatically parse headings (H1–H6) and body content</li>
              <li>View clean, organized breakdowns of top pages</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Summaries</CardTitle>
            <CardDescription>Quick insights at your fingertips</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              <li>Generate quick outlines with one click</li>
              <li>Extract key insights without the fluff</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Master Outline Generator</CardTitle>
            <CardDescription>Optimized content roadmaps</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              <li>Combine multiple competitor outlines into one brief</li>
              <li>Get clear roadmaps for your content</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collaboration & Export</CardTitle>
            <CardDescription>Seamless team workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              <li>Share briefs with your team</li>
              <li>Export to Google Docs, Word, or PDF</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
