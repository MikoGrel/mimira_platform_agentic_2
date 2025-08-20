"use client";

import { createClient } from "$/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables } from "$/types/supabase";

export function useUpdateTenderStatus() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tenderId,
      status,
      partIds,
      partsStatus,
    }: {
      tenderId: string;
      status: Tables<"tenders">["status"];
      partIds?: string[];
      partsStatus?: Tables<"tender_parts">["status"];
    }) => {
      const { data, error } = await client
        .from("tenders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tenderId);

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
    onSuccess: (_, { tenderId }) => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      queryClient.invalidateQueries({ queryKey: ["tenders-list"] });
      queryClient.invalidateQueries({ queryKey: ["tender", tenderId] });
    },
  });
}
