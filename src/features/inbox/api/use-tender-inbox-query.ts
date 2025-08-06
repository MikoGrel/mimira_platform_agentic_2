"use client";

import {
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";
import useCurrentUser from "$/features/auth/api/use-current-user";
import { CalendarDate } from "@heroui/react";
import { getLocalTimeZone } from "@internationalized/date";
import { format } from "date-fns";
import { Voivodeship } from "$/features/i18n/config/poland-config";
import { SortDirection } from "../hooks/use-filter-form";
import { Tables } from "$/types/supabase";

interface UseTenderInboxQueryParams {
  pageSize?: number;
  search?: string;
  filterQuery?: {
    offersDeadlineFrom: CalendarDate | null;
    offersDeadlineTo: CalendarDate | null;
    publishedAtFrom: CalendarDate | null;
    publishedAtTo: CalendarDate | null;
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
  const filters: UseTenderInboxQueryParams["filterQuery"] = filterQuery || {
    offersDeadlineFrom: null,
    offersDeadlineTo: null,
    publishedAtFrom: null,
    publishedAtTo: null,
    voivodeship: null,
    sortBy: null,
  };

  const queryKey = [
    "tenders",
    search,
    [
      filters.publishedAtFrom?.toString(),
      filters.publishedAtTo?.toString,
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
      let query = client
        .from("tenders")
        .select("*", { count: "exact" })
        .eq("company", user!.profile!.customer!);

      query = query.eq("can_participate", true);

      if (search) {
        query = query.textSearch("orderobject", search);
      }

      if (filters.publishedAtFrom) {
        query = query.gte(
          "publicationdate",
          format(
            filters.publishedAtFrom.toDate(getLocalTimeZone()),
            "yyyy-MM-dd"
          )
        );
      }
      if (filters.publishedAtTo) {
        query = query.lte(
          "publicationdate",
          format(filters.publishedAtTo.toDate(getLocalTimeZone()), "yyyy-MM-dd")
        );
      }

      if (filters.offersDeadlineFrom) {
        query = query.gte(
          "submittingoffersdate",
          format(
            filters.offersDeadlineFrom.toDate(getLocalTimeZone()),
            "yyyy-MM-dd"
          )
        );
      }
      if (filters.offersDeadlineTo) {
        query = query.lte(
          "submittingoffersdate",
          format(
            filters.offersDeadlineTo.toDate(getLocalTimeZone()),
            "yyyy-MM-dd"
          )
        );
      }

      if (filters.voivodeship) {
        query = query.in("voivodship", Array.from(filters.voivodeship));
      }

      const sortAscending =
        Array.from(filters.sortBy || new Set())[0] === "asc";
      const shouldSort = filters.sortBy !== null;

      const result = await query
        .order("submittingoffersdate", {
          ascending: shouldSort ? sortAscending : false,
        })
        .order("id", { ascending: false })
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
