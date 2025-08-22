"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";

interface UpdatePartStatusParams {
  id: string;
  status: string;
}

export function useUpdatePartStatus() {
  const queryClient = useQueryClient();
  const client = createClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdatePartStatusParams) => {
      const { data, error } = await client
        .from("tender_parts")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update part status: ${error.message}`);
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
