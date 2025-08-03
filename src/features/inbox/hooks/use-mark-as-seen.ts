import { createClient } from "$/lib/supabase/client";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";

export function useMarkAsSeen(
  options?: Omit<UseMutationOptions<void, PostgrestError, string>, "mutationFn">
) {
  const client = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client
        .from("tenders")
        .update({ seen_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    ...options,
  });
}
