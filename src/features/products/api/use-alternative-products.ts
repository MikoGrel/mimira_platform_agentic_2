"use client";

import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useProducts({ ids }: { ids: string[] }) {
  const client = createClient();

  return useQuery({
    queryKey: ["products", ids],
    queryFn: async () => {
      const { data, error } = await client
        .from("tender_products")
        .select("*")
        .in("id", ids);

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: ids.length > 0,
  });
}
