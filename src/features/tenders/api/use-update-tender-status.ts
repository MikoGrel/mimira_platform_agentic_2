"use client";

import { createClient } from "$/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IndividualTenderMapping,
  IndividualTenderPart,
} from "./use-individual-tender";

export function useUpdateTenderStatus() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mappingId,
      status,
      partIds,
      partsStatus,
    }: {
      mappingId: string;
      status: IndividualTenderMapping["status"];
      partIds?: string[];
      partsStatus?: IndividualTenderPart["status"];
    }) => {
      const { data, error } = await client
        .from("companies_tenders_mappings")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mappingId);

      if (error) {
        throw error;
      }

      if (partIds) {
        const { error: partsError } = await client
          .from("tender_parts")
          .update({
            status: partsStatus,
            updated_at: new Date().toISOString(),
          })
          .in("id", partIds);

        if (partsError) {
          throw partsError;
        }
      }

      return data;
    },
    onSuccess: (_, { mappingId }) => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      queryClient.invalidateQueries({ queryKey: ["tenders-list"] });
      queryClient.invalidateQueries({ queryKey: ["tender", mappingId] });
    },
  });
}
