
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-24 px-4 md:px-6 lg:px-8 space-y-8">
        <div className="container mx-auto max-w-5xl text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
            Outrank Your Competitors with Intelligent SERP Analysis
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-[42rem] mx-auto">
            SERPBriefs automates competitor research, content outlines, and SEO insights—so you can focus on creating winning content, faster.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/app">
              <Button size="lg" className="font-medium">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Automated SERP Analysis</h3>
              <p className="text-muted-foreground">
                Instantly gather the top 5–10 search results for any keyword.
              </p>
            </div>
            <div className="p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Competitor Outlines</h3>
              <p className="text-muted-foreground">
                See how leading pages are organized and what topics they cover.
              </p>
            </div>
            <div className="p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Master Content Brief</h3>
              <p className="text-muted-foreground">
                Merge insights from all competitors into a single, optimized brief.
              </p>
            </div>
            <div className="p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Built-In AI Summaries</h3>
              <p className="text-muted-foreground">
                Let our AI generate quick overviews and key points for each page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <blockquote className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl italic mb-4">
              "SERPBriefs cut our content planning time in half—our writers love it!"
            </p>
            <footer className="text-muted-foreground">
              – Alex P., Content Strategist
            </footer>
          </blockquote>
        </div>
      </section>
    </div>
  );
}
