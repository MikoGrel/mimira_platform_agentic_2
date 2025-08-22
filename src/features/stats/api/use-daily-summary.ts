"use client";

import { useCurrentUser } from "$/features/auth/api";
import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useDailySummary() {
  const { user } = useCurrentUser();
  const client = createClient();

  return useQuery({
    queryKey: ["daily-summary"],
    queryFn: async () => {
      const { data, error } = await client.rpc("get_tenders_summary", {
        p_company_id: user!.profile!.company_id!,
      });

      if (error) throw error;

      return data;
    },
    enabled: !!user?.profile?.company_id,
  });
}
