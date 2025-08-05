"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";
import useCurrentUser from "$/features/auth/api/use-current-user";

interface UseIndividualTenderParams {
  tenderId: string | null;
  enabled?: boolean;
}

export function useIndividualTender({
  tenderId,
  enabled = true,
}: UseIndividualTenderParams) {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ["tender", tenderId],
    queryFn: async () => {
      if (!tenderId) return null;

      const client = createClient();
      const { data, error } = await client
        .from("tenders")
        .select("*")
        .eq("id", tenderId)
        .eq("company", user!.profile!.customer!)
        .eq("can_participate", true)
        .single();

      if (error) {
        console.error("Error fetching individual tender:", error);
        return null;
      }

      return data;
    },
    enabled: enabled && !!tenderId && !!user,
  });
}
