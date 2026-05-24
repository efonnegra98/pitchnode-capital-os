import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all data in parallel — use User list as source of truth
    const [usersRaw, profilesRaw, companiesRaw, investorsRaw, updatesRaw] = await Promise.all([
      base44.asServiceRole.entities.User.list('-created_date', 500),
      base44.asServiceRole.entities.UserProfile.list('-created_date', 500),
      base44.asServiceRole.entities.Company.list('-created_date', 500),
      base44.asServiceRole.entities.Investor.list('-created_date', 1000),
      base44.asServiceRole.entities.MonthlyUpdate.list('-created_date', 1000),
    ]);

    const users = Array.isArray(usersRaw) ? usersRaw : [];
    const profiles = Array.isArray(profilesRaw) ? profilesRaw : [];
    const companies = Array.isArray(companiesRaw) ? companiesRaw : [];
    const investors = Array.isArray(investorsRaw) ? investorsRaw : [];
    const updates = Array.isArray(updatesRaw) ? updatesRaw : [];

    // Build lookup maps
    const profilesByEmail = Object.fromEntries(profiles.map(p => [p.user_email, p]));
    const companiesById = Object.fromEntries(companies.map(c => [c.id, c]));

    const now = new Date();

    const rows = users.map(u => {
      const profile = profilesByEmail[u.email] || null;
      const company = profile?.company_id ? companiesById[profile.company_id] : null;
      const companyInvestors = company ? investors.filter(i => i.company_id === company.id) : [];
      const companyUpdates = company ? updates.filter(upd => upd.company_id === company.id) : [];
      const lastSentUpdate = companyUpdates
        .filter(upd => upd.status === 'sent' && upd.sent_date)
        .sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date))[0];

      const trialEnd = company?.trial_end_date ? new Date(company.trial_end_date) : null;
      const trialActive = trialEnd ? now <= trialEnd : false;
      const subscriptionStatus = company?.subscription_status || 'trialing';

      return {
        // Identity — sourced from User record (always present)
        user_id: u.id,
        user_email: u.email,
        full_name: u.full_name || '—',
        signup_date: u.created_date,
        last_login_date: u.updated_date || u.created_date,
        auth_role: u.role,

        // Profile data (may be null for users who haven't completed onboarding)
        profile_id: profile?.id || null,
        has_profile: !!profile,
        onboarding_completed: profile?.onboarding_completed || false,
        role: profile?.role || '—',
        client_status: profile?.client_status || '—',

        // Company data
        company_id: company?.id || null,
        company_name: company?.name || '—',
        founder_name: company?.founder_name || u.full_name || '—',

        // Subscription
        trial_end_date: company?.trial_end_date || null,
        trial_active: trialActive,
        subscription_status: subscriptionStatus,

        // Activity
        investor_count: companyInvestors.length,
        updates_count: companyUpdates.length,
        last_update_sent: lastSentUpdate?.sent_date || null,

        // Legacy alias so existing UI fields still work
        created_date: u.created_date,
      };
    });

    // Sort: users with profiles first, then by signup date desc
    rows.sort((a, b) => {
      if (a.has_profile && !b.has_profile) return -1;
      if (!a.has_profile && b.has_profile) return 1;
      return new Date(b.signup_date) - new Date(a.signup_date);
    });

    return Response.json({ users: rows });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});