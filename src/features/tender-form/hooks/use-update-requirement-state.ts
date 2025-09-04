"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";

interface UpdateRequirementStateParams {
  id: string[];
  status: "approve" | "reject" | "default";
  reason?: string;
}

export function useUpdateRequirementState() {
  const queryClient = useQueryClient();
  const client = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      reason,
    }: UpdateRequirementStateParams) => {
      const { data, error } = await client
        .from("tender_requirements")
        .update({ status, reason })
        .in("id", id)
        .select();

      if (error) {
        throw new Error(`Failed to update requirement: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tender"] });
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
  });
}
