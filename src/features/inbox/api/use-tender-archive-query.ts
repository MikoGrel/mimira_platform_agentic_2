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
import { baseTenderQuery } from "./base-tender-query";

interface UseTenderArchiveQueryParams {
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

export default function useTenderArchiveQuery({
  pageSize,
  search,
  filterQuery,
}: UseTenderArchiveQueryParams) {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const filters: UseTenderArchiveQueryParams["filterQuery"] = filterQuery || {
    offersDeadlineFrom: null,
    offersDeadlineTo: null,
    publishedAtFrom: null,
    publishedAtTo: null,
    voivodeship: null,
    sortBy: null,
  };

  const queryKey = [
    "tenders-archive",
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
      const today = format(new Date(), "yyyy-MM-dd");

      // Archive shows only expired tenders (past submitting_offers_date)
      // Rejected tenders are excluded from archive

      let query = baseTenderQuery(client)
        .eq("company_id", user!.profile!.company_id!)
        .eq("can_participate", true)
        .neq("status", "rejected"); // Exclude rejected tenders from archive

      // Apply search filter
      if (search) {
        query = query.ilike("tenders.order_object", `%${search}%`);
      }

      // Apply publication date filters
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

      // Apply offers deadline filters
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

      // Apply voivodeship filter
      if (filters.voivodeship) {
        query = query.in("tenders.voivodship", Array.from(filters.voivodeship));
      }

      // Sort by most recently updated first for archive
      // This makes more sense than sorting by deadline for expired tenders
      query = query
        .order("marked_as_favorite", { ascending: false, nullsFirst: false })
        .order("updated_at", {
          ascending: false,
          nullsFirst: false,
        });

      const result = await query.range(
        pageParam * pageSize!,
        pageParam * pageSize! + pageSize! - 1
      );

      // Filter results to show only archived tenders:
      // Only tenders with expired submitting_offers_date (past deadline)
      const archivedTenders = (result.data || []).filter((tender) => {
        const isExpired =
          tender.tenders?.submitting_offers_date &&
          tender.tenders.submitting_offers_date < today;

        return isExpired;
      });

      return {
        data: archivedTenders,
        count: result.count,
        nextPage:
          result.data && result.data.length === pageSize ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!user,
  });

  function updateSeenAt(
    id: string,
    value: string | null = new Date().toISOString()
  ) {
    queryClient.setQueryData(
      queryKey,
      (
        oldData:
          | InfiniteData<{
              data: Tables<"companies_tenders_mappings">[];
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
              mapping.id === id ? { ...mapping, seen_at: value } : mapping
            ),
          })),
        };
      }
    );
  }

  async function markAsFavorite(id: string, value: boolean) {
    queryClient.setQueryData(
      queryKey,
      (
        oldData:
          | InfiniteData<{
              data: Tables<"companies_tenders_mappings">[];
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
              mapping.id === id
                ? { ...mapping, marked_as_favorite: value }
                : mapping
            ),
          })),
        };
      }
    );

    const client = createClient();
    await client
      .from("companies_tenders_mappings")
      .update({ marked_as_favorite: value })
      .eq("id", id);
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
    markAsFavorite,
  };
}

export type ArchiveTenderMapping = Awaited<
  ReturnType<typeof useTenderArchiveQuery>
>["tenders"][number];

export type ArchiveTender = ArchiveTenderMapping["tenders"];

export type ArchiveTenderPart = ArchiveTenderMapping["tender_parts"][number];

export type ArchiveTenderProduct = ArchiveTenderPart["tender_products"][number];

export type ArchiveTenderRequirement =
  ArchiveTenderPart["tender_requirements"][number];
