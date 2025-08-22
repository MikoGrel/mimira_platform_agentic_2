"use client";

import { createClient } from "$/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRejectTender() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mappingId: string) => {
      const { data, error } = await client
        .from("companies_tenders_mappings")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", mappingId);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, tenderId) => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      queryClient.invalidateQueries({ queryKey: ["tender", tenderId] });
    },
  });
}
