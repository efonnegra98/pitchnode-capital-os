import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      endpointSecret
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const companyId = session.metadata.company_id;
        const subscriptionId = session.subscription;

        if (companyId) {
          await base44.asServiceRole.entities.Company.update(companyId, {
            subscription_status: 'active',
            stripe_subscription_id: subscriptionId
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Find company by stripe_subscription_id
        const companies = await base44.asServiceRole.entities.Company.filter({
          stripe_subscription_id: subscription.id
        });

        if (companies.length > 0) {
          const company = companies[0];
          let newStatus = 'expired';

          if (subscription.status === 'active') {
            newStatus = 'active';
          } else if (subscription.status === 'trialing') {
            newStatus = 'trialing';
          }

          await base44.asServiceRole.entities.Company.update(company.id, {
            subscription_status: newStatus
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        // Find company and mark as expired
        const companies = await base44.asServiceRole.entities.Company.filter({
          stripe_subscription_id: subscriptionId
        });

        if (companies.length > 0) {
          await base44.asServiceRole.entities.Company.update(companies[0].id, {
            subscription_status: 'expired'
          });
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});