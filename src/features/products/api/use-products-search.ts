"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";
import { useMemo } from "react";
import { useCurrentUser } from "$/features/auth/api";

const PAGE_SIZE = 10;

interface ProductFilters {
  search?: string;
  categories?: string[];
}

interface SearchOptions {
  enabled?: boolean;
}

export function useProductsSearch(
  filters: ProductFilters,
  options: SearchOptions = {}
) {
  const { user } = useCurrentUser();
  const { enabled = true } = options;
  const client = createClient();

  const queryKey = ["products", "search", filters];

  const {
    data: productsData,
    isLoading: loading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    getNextPageParam: (lastPage: { nextCursor: number | null }) =>
      lastPage.nextCursor,
    queryFn: async ({ pageParam = 0 }) => {
      const query = client
        .from("catalogue_products")
        .select(
          "*,companies_catalogues!inner(id) ,subcategory:product_catalogues_subcategories!inner(name, category:product_catalogues_categories!inner(id,name))"
        )
        .eq("companies_catalogues.company_id", user!.profile!.company_id!)
        .range(pageParam as number, (pageParam as number) + PAGE_SIZE - 1)
        .throwOnError();

      if (filters.search) {
        query.textSearch("name", filters.search, { type: "websearch" });
      }

      if (filters.categories && filters.categories.length > 0) {
        query.in("subcategory.category.id", filters.categories);
      }

      const { data } = await query;

      const hasMore = data && data.length === PAGE_SIZE;
      const nextCursor = hasMore ? (pageParam as number) + PAGE_SIZE : null;

      return {
        data: data || [],
        nextCursor,
      };
    },
    enabled: !!user && enabled,
  });

  const products = useMemo(() => {
    return productsData?.pages.flatMap((page) => page.data) || [];
  }, [productsData]);

  return {
    products,
    loading,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    hasProducts: products.length > 0,
  };
}

export type ProductSearchResult = Awaited<
  ReturnType<typeof useProductsSearch>
>["products"][number];
