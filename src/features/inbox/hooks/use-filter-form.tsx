"use client";

import { useForm } from "react-hook-form";
import { RangeValue } from "@heroui/react";
import { useQueryStates } from "nuqs";
import { Voivodeship } from "$/features/i18n/config/poland-config";
import { format } from "date-fns";
import {
  CalendarDate,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import { ReactNode, useMemo } from "react";
import { parseAsSet } from "$/utils/query";

export type SortDirection = "asc" | "desc";

export const sortingOptions = [
  { key: "asc", label: "Ascending" },
  { key: "desc", label: "Descending" },
];

export interface FilterForm {
  dateRange: RangeValue<CalendarDate> | null;
  voivodeship: Set<Voivodeship> | null;
  sortBy: Set<SortDirection> | null;
}

export interface ActiveFilter {
  key: string;
  label: ReactNode;
  value: ReactNode;
  type: "sorting" | "filter";
  icon?: string;
}

export function useFilterForm() {
  const [filterQuery, setFilterQuery] = useQueryStates({
    dateFrom: {
      parse: parseDate,
      serialize: (date) => date?.toString() ?? null,
    },
    dateTo: {
      parse: parseDate,
      serialize: (date) => date?.toString() ?? null,
    },
    voivodeship: parseAsSet<Voivodeship>(),
    sortBy: parseAsSet<SortDirection>(),
  });

  const { control, handleSubmit, register } = useForm<FilterForm>({
    defaultValues: {
      dateRange:
        filterQuery.dateFrom && filterQuery.dateTo
          ? {
              start: filterQuery.dateFrom,
              end: filterQuery.dateTo,
            }
          : null,
      voivodeship: filterQuery.voivodeship,
      sortBy: filterQuery.sortBy as SortDirection | null,
    },
  });

  const onFilter = handleSubmit((data) => {
    setFilterQuery({
      dateFrom: data.dateRange?.start,
      dateTo: data.dateRange?.end,
      voivodeship: data.voivodeship,
      sortBy: data.sortBy,
    });
  });

  const activeFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];

    if (filterQuery.dateFrom) {
      filters.push({
        key: "dateFrom",
        label: <span>Date From</span>,
        value: format(
          filterQuery.dateFrom.toDate(getLocalTimeZone()),
          "dd/MM/yyyy"
        ),
        type: "filter",
      });
    }

    if (filterQuery.dateTo) {
      filters.push({
        key: "dateTo",
        label: <span>Date To</span>,
        value: format(
          filterQuery.dateTo.toDate(getLocalTimeZone()),
          "dd/MM/yyyy"
        ),
        type: "filter",
      });
    }

    if (filterQuery.voivodeship && filterQuery.voivodeship.size > 0) {
      filters.push({
        key: "voivodeship",
        label: <span>Voivodeship</span>,
        value: Array.from(filterQuery.voivodeship).join(", "),
        type: "filter",
      });
    }

    if (filterQuery.sortBy) {
      const sortBy = Array.from(filterQuery.sortBy)[0] as SortDirection;

      filters.push({
        key: "sortBy",
        label: <span>Sort by Offers Date</span>,
        value: (
          <span>
            {sortBy === "asc" && <span>Ascending</span>}
            {sortBy === "desc" && <span>Descending</span>}
          </span>
        ),
        type: "sorting",
      });
    }

    return filters;
  }, [filterQuery]);

  const removeFilter = (key: string) => {
    setFilterQuery({
      ...filterQuery,
      [key]: null,
    });
  };

  return {
    control,
    register,
    onFilter,
    filterQuery,
    activeFilters,
    removeFilter,
  };
}
