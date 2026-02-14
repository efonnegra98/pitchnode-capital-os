import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useCompany() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: company } = useQuery({
    queryKey: ["company", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;
      const companies = await base44.entities.Company.filter({ id: profile.company_id });
      return companies[0] || null;
    },
    enabled: !!profile?.company_id,
  });

  return {
    user,
    profile,
    company,
    companyId: profile?.company_id,
    isLoading: !user || !profile || !company,
  };
}