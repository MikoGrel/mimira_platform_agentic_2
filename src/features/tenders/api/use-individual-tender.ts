"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";
import useCurrentUser from "$/features/auth/api/use-current-user";

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
      const { data, error } = await client
        .from("companies_tenders_mappings")
        .select(
          `*,
          tenders!inner (
            *
          ),
          tender_parts (
           id,
           part_name,
           ordercompletiondate_llm,
           wadium_llm,
           review_criteria_llm,
           description_part_long_llm,
           order_number,
           status,
           can_participate,
           tender_products (
            id,
            part_id,
            product_req_name,
            product_req_quantity,
            product_req_spec,
            requirements_to_confirm,
            alternative_products,
            closest_match
           ),
           tender_requirements (
            id,
            part_id,
            requirement_text,
            reason,
            status,
            tender_product_id,
            tender_products (
                id,
                product_req_name,
                product_req_quantity
            )
          )
          )`
        )
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
