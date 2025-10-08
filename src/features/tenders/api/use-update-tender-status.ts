"use client";

import { createClient } from "$/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IndividualTenderPart } from "./use-individual-tender";
import { MappingStatusType } from "../constants/status";

export function useUpdateTenderStatus() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mappingId,
      status,
      partIds,
      partsStatus,
      requirementStatus,
    }: {
      mappingId: string;
      status: MappingStatusType;
      partIds?: string[];
      partsStatus?: IndividualTenderPart["status"];
      requirementStatus?: {
        from: string;
        to: string;
      };
    }) => {
      const { data } = await client
        .from("companies_tenders_mappings")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mappingId)
        .throwOnError();

      if (partIds) {
        await client
          .from("tender_parts")
          .update({
            status: partsStatus,
            updated_at: new Date().toISOString(),
          })
          .in("id", partIds)
          .throwOnError();
      }

      if (requirementStatus) {
        await client
          .from("tender_requirements")
          .update({
            status: requirementStatus.to,
          })
          .in("part_id", partIds ?? [])
          .eq("status", requirementStatus.from)
          .throwOnError();
      }

      return data;
    },
    onSuccess: (_, { mappingId }) => {
      queryClient.invalidateQueries({ queryKey: ["tenders-inbox"] });
      queryClient.invalidateQueries({ queryKey: ["tenders-archive"] });
      queryClient.invalidateQueries({ queryKey: ["tenders-list"] });
      queryClient.invalidateQueries({ queryKey: ["tender", mappingId] });
    },
  });
}
