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
        .from("tenders")
        .select("id, orderobject, status")
        .textSearch("orderobject", trimmed, { type: "phrase" })
        .eq("company", user!.profile!.customer!)
        .eq("can_participate", true)
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: search.trim().length > 3 && !!user?.profile?.customer,
  });
}
