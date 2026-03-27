import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
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

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          company_id: company_id,
          company_name: company.name
        }
      });
      customerId = customer.id;
      
      // Save customer ID to company
      await base44.asServiceRole.entities.Company.update(company_id, {
        stripe_customer_id: customerId
      });
    }

    // Create checkout session
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
      success_url: `${req.headers.get('origin')}/Dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/Upgrade`,
      metadata: {
        company_id: company_id
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});