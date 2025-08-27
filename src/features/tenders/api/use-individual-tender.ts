"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";
import useCurrentUser from "$/features/auth/api/use-current-user";
import { baseTenderQuery } from "$/features/inbox/api/base-tender-query";

interface UseIndividualTenderParams {
  mappingId: string | null;
  enabled?: boolean;
  skipCache?: boolean;
}

export function useIndividualTender({
  mappingId,
  enabled = true,
  skipCache = false,
}: UseIndividualTenderParams) {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ["tender", mappingId],
    queryFn: async () => {
      if (!mappingId) return null;

      const client = createClient();
      const { data, error } = await baseTenderQuery(client)
        .eq("id", mappingId)
        .eq("company_id", user!.profile!.company_id!)
        .eq("can_participate", true)
        .single();

      if (error) {
        console.error("Error fetching individual tender:", error);
        return null;
      }

      return data;
    },
    enabled: enabled && !!mappingId && !!user,
    ...(skipCache && {
      staleTime: 0,
      cacheTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
    }),
  });
}

export type IndividualTenderMapping = NonNullable<
  Awaited<ReturnType<typeof useIndividualTender>>["data"]
>;
export type IndividualTenderPart =
  IndividualTenderMapping["tender_parts"][number];

export type IndividualTender = IndividualTenderMapping["tenders"];
