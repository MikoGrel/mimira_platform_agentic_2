import {
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";
import useCurrentUser from "$/features/auth/hooks/use-current-user";
import { CalendarDate } from "@heroui/react";
import { getLocalTimeZone } from "@internationalized/date";
import { format } from "date-fns";
import { Voivodeship } from "$/features/i18n/config/poland-config";
import { SortDirection } from "./use-filter-form";
import { Tables } from "$/types/supabase";

interface UseTenderInboxQueryParams {
  pageSize: number;
  search: string;
  filterQuery: {
    dateFrom: CalendarDate | null;
    dateTo: CalendarDate | null;
    voivodeship: Set<Voivodeship> | null;
    sortBy: Set<SortDirection> | null;
  };
}

export default function useTenderInboxQuery({
  pageSize,
  search,
  filterQuery,
}: UseTenderInboxQueryParams) {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const queryKey = ["tenders", search, ...Object.values(filterQuery)];

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
      let query = client
        .from("tenders")
        .select("*", { count: "exact" })
        .eq("company", user!.profile!.customer!);

      query = query.eq("can_participate", true);

      if (search) {
        query = query.textSearch("orderobject", search);
      }

      if (filterQuery.dateFrom) {
        query = query.gte(
          "submittingoffersdate",
          format(filterQuery.dateFrom.toDate(getLocalTimeZone()), "yyyy-MM-dd")
        );
      }
      if (filterQuery.dateTo) {
        query = query.lte(
          "submittingoffersdate",
          format(filterQuery.dateTo.toDate(getLocalTimeZone()), "yyyy-MM-dd")
        );
      }

      if (filterQuery.voivodeship) {
        query = query.in("voivodship", Array.from(filterQuery.voivodeship));
      }

      const sortAscending =
        Array.from(filterQuery.sortBy || new Set())[0] === "asc";
      const shouldSort = filterQuery.sortBy !== null;

      const result = await query
        .order("submittingoffersdate", {
          ascending: shouldSort ? sortAscending : false,
        })
        .order("id", { ascending: false })
        .range(pageParam * pageSize, pageParam * pageSize + pageSize - 1);

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

  function updateSeenAt(id: string) {
    queryClient.setQueryData(
      queryKey,
      (
        oldData:
          | InfiniteData<{
              data: Tables<"tenders">[];
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
            data: page.data.map((tender) =>
              tender.id === id
                ? { ...tender, seen_at: new Date().toISOString() }
                : tender
            ),
          })),
        };
      }
    );
  }

  // Flatten the pages data and remove duplicates based on id
  const tenders = tendersData?.pages.flatMap((page) => page.data) || [];
  const uniqueTenders = tenders.filter(
    (tender, index, self) => index === self.findIndex((t) => t.id === tender.id)
  );

  return {
    tenders: uniqueTenders,
    loading,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    updateSeenAt,
  };
}
