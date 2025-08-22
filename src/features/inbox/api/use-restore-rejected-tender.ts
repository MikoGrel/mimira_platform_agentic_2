import { createClient } from "$/lib/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";

export function useRestoreRejectedTender(
  options?: Omit<UseMutationOptions<null, PostgrestError, string>, "mutationFn">
) {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mappingId: string) => {
      const { data, error } = await client
        .from("companies_tenders_mappings")
        .update({
          status: "default",
          updated_at: new Date().toISOString(),
        })
        .eq("id", mappingId);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, mappingId) => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
      queryClient.invalidateQueries({ queryKey: ["tender", mappingId] });
    },
    ...options,
  });
}
