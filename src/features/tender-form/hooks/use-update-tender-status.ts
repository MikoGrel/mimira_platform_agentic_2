"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";

interface UpdateTenderStatusParams {
  mappingId: string;
  status: string;
}

export function useUpdateTenderStatus() {
  const queryClient = useQueryClient();
  const client = createClient();

  return useMutation({
    mutationFn: async ({ mappingId, status }: UpdateTenderStatusParams) => {
      const { data, error } = await client
        .from("companies_tenders_mappings")
        .update({ status })
        .eq("id", mappingId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update tender status: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["tender"] });
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
  });
}
