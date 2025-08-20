"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";

interface UpdateTenderStatusParams {
  tenderId: string;
  status: string;
}

export function useUpdateTenderStatus() {
  const queryClient = useQueryClient();
  const client = createClient();

  return useMutation({
    mutationFn: async ({ tenderId, status }: UpdateTenderStatusParams) => {
      const { data, error } = await client
        .from("tenders")
        .update({ status })
        .eq("id", tenderId)
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
