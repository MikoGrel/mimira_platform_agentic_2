import { createClient } from "$/lib/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import useTenderInboxQuery from "./use-tender-inbox-query";
import { useFilterForm } from "../hooks/use-filter-form";

export function useUnseen(
  options?: Omit<UseMutationOptions<void, PostgrestError, string>, "mutationFn">
) {
  const client = createClient();

  const { filterQuery } = useFilterForm();
  const { updateSeenAt } = useTenderInboxQuery({
    filterQuery,
    pageSize: 10,
    search: "",
  });

  return useMutation({
    mutationFn: async (mappingId: string) => {
      const { error } = await client
        .from("companies_tenders_mappings")
        .update({
          seen_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mappingId);

      if (error) throw error;
      updateSeenAt(mappingId, null);
    },
    ...options,
  });
}
