
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Pricing() {
  return (
    <div className="container mx-auto py-24 px-4 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Whether you're a solo blogger or an agency managing dozens of projects, we've got the perfect plan to fit your needs.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Starter</CardTitle>
            <CardDescription>Perfect for solo content creators</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>Up to 50 SERP analyses per month</li>
              <li>AI Summaries for up to 10 pages per analysis</li>
              <li>1 Master Outline per day</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Start Free Trial</Button>
          </CardFooter>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For growing content teams</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$69</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>Up to 200 SERP analyses per month</li>
              <li>AI Summaries for up to 20 pages per analysis</li>
              <li>5 Master Outlines per day</li>
              <li>Team Collaboration (up to 5 users)</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Start Free Trial</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agency</CardTitle>
            <CardDescription>For professional agencies</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$149</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>Unlimited SERP analyses</li>
              <li>AI Summaries for up to 50 pages per analysis</li>
              <li>Unlimited Master Outlines per day</li>
              <li>Team Collaboration (up to 20 users)</li>
              <li>Priority Support</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Start Free Trial</Button>
          </CardFooter>
        </Card>
      </div>

      <p className="text-center text-muted-foreground">
        All plans come with a 14-day free trial. Cancel anytime, no questions asked.
      </p>
    </div>
  );
}
