import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useCommentsCount({ tenderId }: { tenderId: string }) {
  const client = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["comments-count", tenderId],
    queryFn: async () => {
      const { count, error } = await client
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("tender_id", tenderId);

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
