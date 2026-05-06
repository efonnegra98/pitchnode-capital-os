import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { data, event } = payload;

    // Only fire on create events
    if (event?.type !== 'create') {
      return Response.json({ skipped: true, reason: 'not a create event' });
    }

    const profile = data;

    // Skip if no user email
    if (!profile?.user_email) {
      return Response.json({ skipped: true, reason: 'no user email' });
    }

    // Fetch the user record to get full name and check role
    let userName = profile.user_email;
    try {
      const users = await base44.asServiceRole.entities.User.filter({ email: profile.user_email });
      const user = users?.[0];
      if (user?.role === 'admin') {
        return Response.json({ skipped: true, reason: 'admin account' });
      }
      if (user?.full_name) {
        userName = user.full_name;
      }
    } catch (_) {
      // Continue with email as name fallback
    }

    const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    if (!webhookUrl) {
      return Response.json({ error: 'SLACK_WEBHOOK_URL not set' }, { status: 500 });
    }

    // Format dates in Chicago timezone
    const now = new Date();
    const signupDate = new Date(profile.created_date || now);
    const trialEnd = new Date(signupDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const chicagoOptions = {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    const signupStr = signupDate.toLocaleString('en-US', chicagoOptions);
    const trialEndStr = trialEnd.toLocaleString('en-US', { ...chicagoOptions, hour: undefined, minute: undefined, hour12: undefined });

    const slackBody = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚀 New Capital OS Signup!',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Name:*\n${userName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Email:*\n${profile.user_email}`,
            },
            {
              type: 'mrkdwn',
              text: `*Signed up:*\n${signupStr} CT`,
            },
            {
              type: 'mrkdwn',
              text: `*Trial ends:*\n${trialEndStr}`,
            },
          ],
        },
        {
          type: 'divider',
        },
      ],
    };

    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackBody),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return Response.json({ error: 'Slack webhook failed', details: text }, { status: 500 });
    }

    return Response.json({ success: true, notified: profile.user_email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});