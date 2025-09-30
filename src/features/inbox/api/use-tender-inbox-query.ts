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
    showRejected: boolean | null;
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
    showRejected: false,
  };

  const queryKey = [
    "tenders",
    search,
    [
      filters.publishedAtFrom?.toString(),
      filters.publishedAtTo?.toString,
      filters.offersDeadlineFrom?.toString(),
      filters.offersDeadlineTo?.toString(),
      filters.showRejected,
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

      if (filters.showRejected === false) {
        query = query.eq("status", "default");
      } else if (filters.showRejected === true) {
        query = query.eq("status", "rejected");
      }

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
      } else {
        // By default, filter out expired tenders (only show future deadlines)
        query = query.gte(
          "tenders.submitting_offers_date",
          format(new Date(), "yyyy-MM-dd")
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

      query = query.order("tenders(submitting_offers_date)", {
        ascending: true,
        nullsFirst: false,
      });

      const result = await query.range(
        pageParam * pageSize!,
        pageParam * pageSize! + pageSize! - 1
      );

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

export type InboxTenderMapping = Awaited<
  ReturnType<typeof useTenderInboxQuery>
>["tenders"][number];

export type InboxTender = InboxTenderMapping["tenders"];

export type InboxTenderPart = InboxTenderMapping["tender_parts"][number];

export type InboxTenderProduct = InboxTenderPart["tender_products"][number];

export type InboxTenderRequirement =
  InboxTenderPart["tender_requirements"][number];
