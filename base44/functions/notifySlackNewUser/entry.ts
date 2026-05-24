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

    const user = data;

    // Skip if no email
    if (!user?.email) {
      return Response.json({ skipped: true, reason: 'no email on user record' });
    }

    // Skip admin accounts
    if (user?.role === 'admin' || user?.role === 'owner') {
      return Response.json({ skipped: true, reason: 'admin account' });
    }

    const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    if (!webhookUrl) {
      return Response.json({ error: 'SLACK_WEBHOOK_URL not set' }, { status: 500 });
    }

    const userName = user.full_name || user.email;
    const signupDate = new Date(user.created_date || new Date());
    const trialEnd = new Date(signupDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const chicagoDateTimeOptions = {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    const chicagoDateOptions = {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const signupStr = signupDate.toLocaleString('en-US', chicagoDateTimeOptions) + ' CT';
    const trialEndStr = trialEnd.toLocaleString('en-US', chicagoDateOptions);

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
              text: `*Email:*\n${user.email}`,
            },
            {
              type: 'mrkdwn',
              text: `*Signed up:*\n${signupStr}`,
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

    return Response.json({ success: true, notified: user.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});