import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can run this cleanup
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get the company_id from query params
    const url = new URL(req.url);
    const companyId = url.searchParams.get('company_id');

    if (!companyId) {
      return Response.json({ error: 'company_id query parameter required' }, { status: 400 });
    }

    // Fetch all updates for this company
    const allUpdates = await base44.asServiceRole.entities.MonthlyUpdate.filter({
      company_id: companyId,
    });

    // Group drafts by month
    const draftsByMonth = {};
    const toDelete = [];

    for (const update of allUpdates) {
      if (update.status === 'draft') {
        if (!draftsByMonth[update.month]) {
          draftsByMonth[update.month] = [];
        }
        draftsByMonth[update.month].push(update);
      }
    }

    // For each month with multiple drafts, keep the most recent one
    for (const month in draftsByMonth) {
      const drafts = draftsByMonth[month];
      if (drafts.length > 1) {
        // Sort by created_date, most recent first
        drafts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        // Mark all but the first (most recent) for deletion
        for (let i = 1; i < drafts.length; i++) {
          toDelete.push(drafts[i].id);
        }
      }
    }

    // Delete duplicate drafts
    for (const id of toDelete) {
      await base44.asServiceRole.entities.MonthlyUpdate.delete(id);
    }

    return Response.json({
      success: true,
      deletedCount: toDelete.length,
      message: `Cleaned up ${toDelete.length} duplicate draft entries`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});