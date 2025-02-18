
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="container mx-auto py-24 px-4 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Our Mission: Data-Driven Content for Everyone</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're SERPBriefs, a team of SEOs, developers, and content enthusiasts who believe that data-backed strategies shouldn't be a luxury.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-muted-foreground">
              It all started when our founder, Jordan Smith, realized his agency spent more time on competitor research than on actual writing. With the help of a small development team, Jordan built a prototype that integrated Google search data, AI-based text summaries, and a flexible outline generator. The results were groundbreaking: faster content planning, better organization, and improved search rankings.
            </p>
            <p className="mt-4 text-muted-foreground">
              Today, SERPBriefs is proud to serve thousands of content creators and marketing teams worldwide. We're constantly evolving our platform with new features, guided by our users' feedback.
            </p>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Customer-Centric</h3>
                <p className="text-muted-foreground">
                  We build products that solve real problems, focusing on user experience.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We embrace technology to optimize every step of content creation.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Transparency</h3>
                <p className="text-muted-foreground">
                  Straightforward pricing, open product roadmaps, and honest communication.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
