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

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["company", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;
      const companies = await base44.entities.Company.filter({ id: profile.company_id });
      
      // If company doesn't exist but company_id is set, create a default one
      if (companies.length === 0 && profile.company_id) {
        const newCompany = await base44.entities.Company.create({
          name: "My Company",
          raise_mode: false,
        });
        // Update the profile with the correct company_id
        await base44.entities.UserProfile.update(profile.id, { company_id: newCompany.id });
        return newCompany;
      }
      
      return companies[0] || null;
    },
    enabled: !!profile?.company_id,
  });

  return {
    user,
    profile,
    company,
    companyId: company?.id || profile?.company_id,
    isLoading: !user || !profile || companyLoading,
  };
}