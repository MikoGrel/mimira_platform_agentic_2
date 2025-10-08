"use client";

import { useCurrentUser } from "$/features/auth/api";
import { MappingStatus } from "$/features/tenders/constants/status";
import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useExpiringTenders({ from, to }: { from: Date; to: Date }) {
  const { user } = useCurrentUser();
  const client = createClient();

  return useQuery({
    queryKey: ["expiring-tenders", from, to],
    queryFn: async () => {
      const { data, error } = await client
        .from("companies_tenders_mappings")
        .select("id, tenders!inner (order_object, submitting_offers_date)")
        .gte("tenders.submitting_offers_date", from.toISOString())
        .lte("tenders.submitting_offers_date", to.toISOString())
        .neq("status", MappingStatus.rejected)
        .eq("company_id", user!.profile!.company_id!)
        .eq("can_participate", true);

      if (error) {
        throw error;
      }

      return data;
    },
  });
}
