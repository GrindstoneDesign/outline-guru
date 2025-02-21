
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature || !endpointSecret) {
      throw new Error('Missing stripe signature or webhook secret');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId } = session.metadata || {};
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        console.log('Checkout completed:', { userId, planId, customerId, subscriptionId });

        if (userId && planId) {
          const { error } = await supabase.from('subscriptions').insert({
            user_id: userId,
            plan_id: planId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
          });

          if (error) {
            console.error('Error inserting subscription:', error);
            throw error;
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'inactive' })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error canceling subscription:', error);
          throw error;
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
