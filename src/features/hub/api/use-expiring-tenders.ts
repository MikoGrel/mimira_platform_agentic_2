"use client";

import { useCurrentUser } from "$/features/auth/api";
import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useExpiringTenders({ from, to }: { from: Date; to: Date }) {
  const { user } = useCurrentUser();
  const client = createClient();

  return useQuery({
    queryKey: ["expiring-tenders", from, to],
    queryFn: async () => {
      const { data, error } = await client
        .from("tenders")
        .select("id, submittingoffersdate, orderobject")
        .gte("submittingoffersdate", from.toISOString())
        .lte("submittingoffersdate", to.toISOString())
        .eq("company", user!.profile!.customer!)
        .eq("can_participate", true);

      if (error) {
        throw error;
      }

      return data;
    },
  });
}
