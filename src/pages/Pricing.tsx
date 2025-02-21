
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";

interface Plan {
  id: string;
  name: string;
  price_amount: number;
  price_id: string;
  features: Json;
  credits: number;
  created_at: string;
}

export default function Pricing() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_amount');

      if (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription plans",
          variant: "destructive",
        });
      } else {
        setPlans(data);
      }
    };

    fetchPlans();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const handleSubscribe = async (priceId: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          priceId,
          userId: session.user.id,
        },
      });

      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start subscription process",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-24 px-4 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Whether you're a solo blogger or an agency managing dozens of projects, we've got the perfect plan to fit your needs.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.name === 'Pro' ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>Perfect for {plan.name === 'Starter' ? 'solo content creators' : plan.name === 'Pro' ? 'growing content teams' : 'professional agencies'}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price_amount}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.isArray(plan.features) && plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <span>✓</span>
                    {String(feature)}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => handleSubscribe(plan.price_id)}
                disabled={loading}
              >
                {loading ? "Processing..." : "Start Free Trial"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <p className="text-center text-muted-foreground">
        All plans come with a 14-day free trial. Cancel anytime, no questions asked.
      </p>
    </div>
  );
}
