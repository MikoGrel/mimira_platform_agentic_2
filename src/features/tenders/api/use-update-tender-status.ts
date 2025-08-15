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
    }: {
      tenderId: string;
      status: Tables<"tenders">["status"];
      partIds?: string[];
    }) => {
      console.log("partIds", partIds);

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

      return data;
    },
    onSuccess: (_, { tenderId }) => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      queryClient.invalidateQueries({ queryKey: ["tenders-list"] });
      queryClient.invalidateQueries({ queryKey: ["tender", tenderId] });
    },
  });
}
