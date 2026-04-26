import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_id } = await req.json();

    if (!company_id) {
      return Response.json({ error: 'Company ID required' }, { status: 400 });
    }

    const companies = await base44.entities.Company.filter({ id: company_id });
    const company = companies[0];

    if (!company) {
      return Response.json({ error: 'Company not found' }, { status: 404 });
    }

    let customerId = company.stripe_customer_id;

    // Create Stripe customer if not yet created
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: company.founder_name || user.full_name || '',
        metadata: {
          company_id,
          company_name: company.name,
          user_email: user.email,
        },
      });
      customerId = customer.id;

      await base44.asServiceRole.entities.Company.update(company_id, {
        stripe_customer_id: customerId,
      });
    }

    // Check if customer already has an active subscription
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });
    if (existingSubscriptions.data.length > 0) {
      return Response.json({ error: 'Already subscribed' }, { status: 409 });
    }

    const origin = req.headers.get('origin') || 'https://app.pitchnode.com';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: Deno.env.get("STRIPE_PRICE_ID"),
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: {
          company_id,
        },
      },
      metadata: {
        company_id,
      },
      success_url: `${origin}/Dashboard?checkout=success`,
      cancel_url: `${origin}/Subscribe?checkout=canceled`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});