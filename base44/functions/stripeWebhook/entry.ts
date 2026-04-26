import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

async function findCompanyBySubscriptionId(base44, subscriptionId) {
  const companies = await base44.asServiceRole.entities.Company.filter({
    stripe_subscription_id: subscriptionId
  });
  return companies[0] || null;
}

async function findCompanyByCustomerId(base44, customerId) {
  const companies = await base44.asServiceRole.entities.Company.filter({
    stripe_customer_id: customerId
  });
  return companies[0] || null;
}

function mapStripeStatusToInternal(stripeStatus) {
  switch (stripeStatus) {
    case 'active': return 'active';
    case 'trialing': return 'trialing';
    case 'past_due': return 'active'; // still has access, but warn via payment_failed event
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'expired';
    default:
      return 'expired';
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'No signature' }, { status: 400 });
    }

    const event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);

    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object;
        const companyId = session.metadata?.company_id;
        const subscriptionId = session.subscription;

        if (companyId && subscriptionId) {
          // Fetch full subscription to get current_period_end
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

          await base44.asServiceRole.entities.Company.update(companyId, {
            subscription_status: 'active',
            stripe_subscription_id: subscriptionId,
            trial_end_date: periodEnd,
          });
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const company = await findCompanyByCustomerId(base44, subscription.customer);
        if (company) {
          const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
          await base44.asServiceRole.entities.Company.update(company.id, {
            subscription_status: mapStripeStatusToInternal(subscription.status),
            stripe_subscription_id: subscription.id,
            trial_end_date: periodEnd,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const company = await findCompanyBySubscriptionId(base44, subscription.id)
          || await findCompanyByCustomerId(base44, subscription.customer);

        if (company) {
          const newStatus = mapStripeStatusToInternal(subscription.status);
          const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

          // If canceled at period end, keep active until then
          const isCanceledAtPeriodEnd = subscription.cancel_at_period_end;
          await base44.asServiceRole.entities.Company.update(company.id, {
            subscription_status: isCanceledAtPeriodEnd ? 'active' : newStatus,
            stripe_subscription_id: subscription.id,
            trial_end_date: periodEnd,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const company = await findCompanyBySubscriptionId(base44, subscription.id)
          || await findCompanyByCustomerId(base44, subscription.customer);

        if (company) {
          // Access removed immediately on hard cancel
          await base44.asServiceRole.entities.Company.update(company.id, {
            subscription_status: 'expired',
            // Keep stripe_subscription_id for record-keeping
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const company = await findCompanyBySubscriptionId(base44, subscriptionId);
        if (company) {
          // Refresh subscription to get updated period end
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

          await base44.asServiceRole.entities.Company.update(company.id, {
            subscription_status: 'active',
            trial_end_date: periodEnd,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const company = await findCompanyBySubscriptionId(base44, subscriptionId);
        if (company) {
          // Check attempt count — expire only if exhausted
          const attemptCount = invoice.attempt_count || 1;
          const newStatus = attemptCount >= 3 ? 'expired' : 'active'; // Keep access but let UI warn
          await base44.asServiceRole.entities.Company.update(company.id, {
            subscription_status: newStatus,
          });
          console.log(`Payment failed for company ${company.id}, attempt ${attemptCount}, status set to ${newStatus}`);
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