import { createClient } from "$/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRestoreRejectedTender() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenderId: string) => {
      const { data, error } = await client
        .from("tenders")
        .update({
          status: "default",
        })
        .eq("id", tenderId);

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
