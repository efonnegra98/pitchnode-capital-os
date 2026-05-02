import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const EMAIL_CONFIGS = {
  1: {
    subject: "Welcome to Capital OS — here's how to get started",
    buildBody: (firstName) => `Hi ${firstName},

Your 7-day free trial of Capital OS has started — welcome!

Here are 3 things to do first:

1. Set up your company profile in Settings
2. Add your first investors to the CRM
3. Upload your pitch deck to the Data Room

<a href="https://platformcapitalos.com/Dashboard" style="display:inline-block;background:#6D5DF6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Go to Your Dashboard</a>

Eduardo at PitchNode`
  },
  2: {
    subject: "4 days left — have you tried the AI Update Builder?",
    buildBody: (firstName) => `Hey ${firstName},

Just checking in — you have 4 days left in your trial.

One feature worth trying: the AI Draft Update. One click and it writes your entire investor update automatically, ready to send.

<a href="https://platformcapitalos.com/UpdateBuilder" style="display:inline-block;background:#6D5DF6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Try AI Draft Update</a>

— Eduardo at PitchNode`
  },
  3: {
    subject: "Your Capital OS trial ends tomorrow",
    buildBody: (firstName) => `Hey ${firstName},

Your 7-day trial ends tomorrow. After that you'll lose access to your investor CRM, data room, and AI updates.

Subscribe now to keep everything running. $49/month, cancel anytime.

<a href="https://buy.stripe.com/3cI00jf5Demc8vteLS7Zu00" style="display:inline-block;background:#6D5DF6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Subscribe Now — $49/mo</a>

— Eduardo at PitchNode`
  },
  4: {
    subject: "Your trial has ended — pick up where you left off",
    buildBody: (firstName) => `Hey ${firstName},

Your free trial has ended. Your data is saved and ready.

Subscribe to get back in and continue managing your raise.

<a href="https://buy.stripe.com/3cI00jf5Demc8vteLS7Zu00" style="display:inline-block;background:#6D5DF6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Reactivate Access</a>

— Eduardo at PitchNode`
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email_number } = await req.json();

    if (!email_number || !EMAIL_CONFIGS[email_number]) {
      return Response.json({ error: 'Invalid email_number (must be 1, 2, 3, or 4)' }, { status: 400 });
    }

    const config = EMAIL_CONFIGS[email_number];

    // Get all user profiles
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const trialProfiles = profiles.filter(p => p.onboarding_completed && p.company_id);

    let sent = 0;
    let skipped = 0;

    for (const profile of trialProfiles) {
      // Check if we already sent this email to this user
      const existing = await base44.asServiceRole.entities.TrialEmail.filter({
        user_email: profile.user_email,
        email_number: email_number
      });

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Get company to confirm trial status
      const companies = await base44.asServiceRole.entities.Company.filter({ id: profile.company_id });
      const company = companies[0];

      if (!company || !company.trial_start_date) {
        skipped++;
        continue;
      }

      // For emails 1-3: only send if still trialing
      // For email 4: only send if trial has expired
      const now = new Date();
      const trialEnd = company.trial_end_date ? new Date(company.trial_end_date) : null;
      const isTrialing = company.subscription_status === 'trialing';
      const isExpired = company.subscription_status === 'expired' || (trialEnd && now > trialEnd);
      const isActive = company.subscription_status === 'active';

      // Skip users who have already subscribed
      if (isActive) {
        skipped++;
        continue;
      }

      if (email_number < 4 && !isTrialing) {
        skipped++;
        continue;
      }

      if (email_number === 4 && !isExpired) {
        skipped++;
        continue;
      }

      // Get first name from user record
      const users = await base44.asServiceRole.entities.User.filter({ email: profile.user_email });
      const userRecord = users[0];
      const fullName = userRecord?.full_name || profile.user_email.split('@')[0];
      const firstName = fullName.split(' ')[0];

      const bodyHtml = `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
${config.buildBody(firstName).replace(/\n/g, '<br>')}
</div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: profile.user_email,
        subject: config.subject,
        body: bodyHtml,
        from_name: 'Eduardo at PitchNode'
      });

      // Record that we sent it
      await base44.asServiceRole.entities.TrialEmail.create({
        user_email: profile.user_email,
        company_id: profile.company_id,
        email_number: email_number,
        sent_at: now.toISOString()
      });

      sent++;
    }

    return Response.json({ success: true, sent, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});