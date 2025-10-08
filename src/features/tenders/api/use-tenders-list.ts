"use client";

import {
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";
import useCurrentUser from "$/features/auth/api/use-current-user";
import { getLocalTimeZone } from "@internationalized/date";
import { format } from "date-fns";
import { FilterQuery } from "$/features/inbox/hooks/use-filter-form";
import { Tables } from "$/types/supabase";
import { baseTenderQuery } from "$/features/inbox/api/base-tender-query";

interface UseTendersListParams {
  pageSize?: number;
  search?: string;
  filterQuery?: FilterQuery;
}

export function useTendersList({
  pageSize = 20,
  search,
  filterQuery,
}: UseTendersListParams = {}) {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const filters: UseTendersListParams["filterQuery"] = filterQuery || {
    offersDeadlineFrom: null,
    offersDeadlineTo: null,
    publishedAtFrom: null,
    publishedAtTo: null,
    voivodeship: null,
    sortBy: null,
  };

  const queryKey = [
    "tenders-list",
    search,
    [
      filters.publishedAtFrom?.toString(),
      filters.publishedAtTo?.toString(),
      filters.offersDeadlineFrom?.toString(),
      filters.offersDeadlineTo?.toString(),
      JSON.stringify(Array.from(filters.sortBy || [])),
      JSON.stringify(Array.from(filters.voivodeship || [])),
    ],
  ];

  const {
    data: tendersData,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const client = createClient();
      let query = baseTenderQuery(client).eq(
        "company_id",
        user!.profile!.company_id!
      );

      query = query.neq("status", "default");
      query = query.eq("can_participate", true);

      if (search) {
        query = query.ilike("tenders.order_object", `%${search}%`);
      }

      if (filters.publishedAtFrom) {
        query = query.gte(
          "tenders.publication_date",
          format(
            filters.publishedAtFrom.toDate(getLocalTimeZone()),
            "yyyy-MM-dd"
          )
        );
      }
      if (filters.publishedAtTo) {
        query = query.lte(
          "tenders.publication_date",
          format(filters.publishedAtTo.toDate(getLocalTimeZone()), "yyyy-MM-dd")
        );
      }

      if (filters.offersDeadlineFrom) {
        query = query.gte(
          "tenders.submitting_offers_date",
          format(
            filters.offersDeadlineFrom.toDate(getLocalTimeZone()),
            "yyyy-MM-dd"
          )
        );
      }
      if (filters.offersDeadlineTo) {
        query = query.lte(
          "tenders.submitting_offers_date",
          format(
            filters.offersDeadlineTo.toDate(getLocalTimeZone()),
            "yyyy-MM-dd"
          )
        );
      }

      if (filters.voivodeship) {
        query = query.in("tenders.voivodship", Array.from(filters.voivodeship));
      }

      if (filters.sortBy) {
        query = query.order("tenders.submitting_offers_date", {
          ascending: Array.from(filters.sortBy)[0] === "asc",
          nullsFirst: false,
        });
      }

      const result = await query
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: false, nullsFirst: false })
        .range(pageParam * pageSize!, pageParam * pageSize! + pageSize! - 1);

      return {
        data: result.data || [],
        count: result.count,
        nextPage:
          result.data && result.data.length === pageSize ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!user,
  });

  function updateTenderStatus(id: string, status: string) {
    queryClient.setQueryData(
      queryKey,
      (
        oldData:
          | InfiniteData<{
              data: Array<{
                id: string;
                status: string | null;
                can_participate: boolean | null;
                seen_at: string | null;
                created_at: string;
                company_id: string | null;
                tender_id: string | null;
                tenders: Tables<"tenders">;
              }>;
              count: number | null;
              nextPage: number | null;
            }>
          | undefined
      ) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((mapping) =>
              mapping.id === id ? { ...mapping, status } : mapping
            ),
          })),
        };
      }
    );
  }

  // Flatten the pages data and remove duplicates based on id
  const mappings = tendersData?.pages.flatMap((page) => page.data) || [];
  const uniqueMappings = mappings.filter(
    (mapping, index, self) =>
      index === self.findIndex((m) => m.id === mapping.id)
  );

  return {
    tenders: uniqueMappings,
    loading,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    updateTenderStatus,
  };
}

export type TenderListItem = Awaited<
  ReturnType<typeof useTendersList>
>["tenders"][number];

export type TenderListItemPart = TenderListItem["tender_parts"][number];
