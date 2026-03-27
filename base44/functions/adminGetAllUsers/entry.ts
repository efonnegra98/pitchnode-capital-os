import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all user profiles, companies, investors, and updates as service role
    const [profilesRaw, companiesRaw, investorsRaw, updatesRaw] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.list('-created_date', 200),
      base44.asServiceRole.entities.Company.list('-created_date', 200),
      base44.asServiceRole.entities.Investor.list('-created_date', 500),
      base44.asServiceRole.entities.MonthlyUpdate.list('-created_date', 500),
    ]);

    const profiles = Array.isArray(profilesRaw) ? profilesRaw : [];
    const companies = Array.isArray(companiesRaw) ? companiesRaw : [];
    const investors = Array.isArray(investorsRaw) ? investorsRaw : [];
    const updates = Array.isArray(updatesRaw) ? updatesRaw : [];

    const companiesById = Object.fromEntries(companies.map(c => [c.id, c]));

    const rows = profiles.map(profile => {
      const company = profile.company_id ? companiesById[profile.company_id] : null;
      const companyInvestors = investors.filter(i => i.company_id === profile.company_id);
      const companyUpdates = updates.filter(u => u.company_id === profile.company_id);
      const lastSentUpdate = companyUpdates
        .filter(u => u.status === 'sent' && u.sent_date)
        .sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date))[0];

      const now = new Date();
      const trialEnd = company?.trial_end_date ? new Date(company.trial_end_date) : null;
      const trialActive = trialEnd ? now <= trialEnd : false;
      const subscriptionStatus = company?.subscription_status || 'trialing';

      return {
        profile_id: profile.id,
        user_email: profile.user_email,
        company_id: profile.company_id,
        company_name: company?.name || '—',
        founder_name: company?.founder_name || '—',
        role: profile.role,
        client_status: profile.client_status,
        onboarding_completed: profile.onboarding_completed,
        created_date: profile.created_date,
        trial_end_date: company?.trial_end_date || null,
        trial_active: trialActive,
        subscription_status: subscriptionStatus,
        investor_count: companyInvestors.length,
        updates_count: companyUpdates.length,
        last_update_sent: lastSentUpdate?.sent_date || null,
      };
    });

    return Response.json({ users: rows });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});