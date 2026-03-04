import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { company_id } = body;

    if (!company_id) {
      return Response.json({ error: 'company_id is required' }, { status: 400 });
    }

    const [investors, updates, companies] = await Promise.all([
      base44.asServiceRole.entities.Investor.filter({ company_id }),
      base44.asServiceRole.entities.MonthlyUpdate.filter({ company_id }),
      base44.asServiceRole.entities.Company.filter({ id: company_id }),
    ]);

    return Response.json({
      company: companies[0] || null,
      investors,
      updates,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});