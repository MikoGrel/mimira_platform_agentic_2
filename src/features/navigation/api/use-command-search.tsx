import { useCurrentUser } from "$/features/auth/api";
import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useCommandSearch(search: string) {
  const { user } = useCurrentUser();
  const client = createClient();
  return useQuery({
    queryKey: ["command-search", search.trim()],
    queryFn: async () => {
      const trimmed = search.trim();
      const { data, error } = await client
        .from("companies_tenders_mappings")
        .select("id, tenders!inner(order_object), status")
        .textSearch("tenders.order_object", trimmed, { type: "phrase" })
        .eq("company_id", user!.profile!.company_id!)
        .eq("can_participate", true)
        .in("status", ["analysis", "default"])
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: search.trim().length > 3 && !!user?.profile?.company_id,
  });
}
