import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useCommentsCount({ mappingId }: { mappingId: string }) {
  const client = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["comments-count", mappingId],
    queryFn: async () => {
      const { count, error } = await client
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("company_mapping_id", mappingId);

      if (error) throw error;

      return count || 0;
    },
  });

  return {
    count: data,
    isLoading,
    error,
  };
}
