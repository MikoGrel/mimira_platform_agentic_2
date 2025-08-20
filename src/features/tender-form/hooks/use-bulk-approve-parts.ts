"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";

interface BulkApprovePartsParams {
  partUuids: string[];
}

export function useBulkApproveParts() {
  const queryClient = useQueryClient();
  const client = createClient();

  return useMutation({
    mutationFn: async ({ partUuids }: BulkApprovePartsParams) => {
      if (partUuids.length === 0) {
        throw new Error("No parts to approve");
      }

      const { data, error } = await client
        .from("tender_parts")
        .update({ status: "approve" })
        .in("part_uuid", partUuids)
        .select();

      if (error) {
        throw new Error(`Failed to approve parts: ${error.message}`);
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
