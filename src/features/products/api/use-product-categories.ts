import { useCurrentUser } from "$/features/auth/api";
import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface CategoriesFilters {
  search?: string;
}

interface CategoriesOptions {
  enabled?: boolean;
}

export function useProductCategories(
  filters: CategoriesFilters,
  options: CategoriesOptions = {}
) {
  const { user } = useCurrentUser();
  const { enabled = true } = options;
  const client = createClient();

  const queryKey = [
    "products",
    "categories",
    "rpc",
    user?.profile?.company_id,
    filters.search,
  ];

  const {
    data: categories,
    isLoading: loading,
    isError,
    isPending,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await client
        .rpc("get_categories_with_products", {
          p_company_uuid: user!.profile!.company_id!,
          p_search: filters.search,
        })
        .throwOnError()
        .limit(20);

      return data || [];
    },
    enabled: !!user?.profile?.company_id && enabled,
  });

  return {
    categories: categories || [],
    loading,
    isPending,
    isError,
    hasCategories: (categories || []).length > 0,
  };
}
