"use client";

import { useCurrentUser } from "$/features/auth/api";
import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useStatusCounts() {
  const { user } = useCurrentUser();
  const client = createClient();

  return useQuery({
    queryKey: ["status-counts"],
    queryFn: async () => {
      const { data } = await client
        .rpc("get_company_mapping_status_counts", {
          p_company_id: user!.profile!.company_id!,
        })
        .throwOnError();

      return data;
    },
  });
}
