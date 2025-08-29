"use client";

import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useCatalogProducts(ids: Array<string | null | undefined>) {
  const client = createClient();
  const actualIds = ids.filter(Boolean) as string[];

  return useQuery({
    queryKey: ["catalog-products", actualIds],
    queryFn: async () => {
      const { data, error } = await client
        .from("catalogue_products")
        .select(
          "*,subcategory:product_catalogues_subcategories(name, category:product_catalogues_categories(id,name))"
        )
        .in("id", actualIds);

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: actualIds.length > 0,
  });
}

export type CatalogProduct = NonNullable<
  Awaited<ReturnType<typeof useCatalogProducts>>["data"]
>[number];
