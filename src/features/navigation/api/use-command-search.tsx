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
        .select("id, orderobject")
        .textSearch("orderobject", trimmed, { type: "websearch" })
        .eq("company", user!.profile!.customer!)
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: search.trim().length > 3 && !!user?.profile?.customer,
  });
}
