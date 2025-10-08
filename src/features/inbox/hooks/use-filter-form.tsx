"use client";

import { useForm } from "react-hook-form";
import { RangeValue } from "@heroui/react";
import { useQueryStates } from "nuqs";
import {
  Voivodeship,
  PolishVoivodeships,
} from "$/features/i18n/config/poland-config";
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
  { key: "asc", label: "Ascending", readable: <span>Ascending</span> },
  { key: "desc", label: "Descending", readable: <span>Descending</span> },
];

export interface FilterFormOptions {
  onFiltered?: (filters: FilterForm) => void;
}

export interface FilterForm {
  publishedAt: RangeValue<CalendarDate> | null;
  offersDeadline: RangeValue<CalendarDate> | null;
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

export interface FilterQuery {
  publishedAtFrom: CalendarDate | null;
  publishedAtTo: CalendarDate | null;
  offersDeadlineFrom: CalendarDate | null;
  offersDeadlineTo: CalendarDate | null;
  voivodeship: Set<Voivodeship> | null;
  sortBy: Set<SortDirection> | null;
}

export function useFilterForm({ onFiltered }: FilterFormOptions = {}) {
  const [filterQuery, setFilterQuery] = useQueryStates({
    publishedAtFrom: {
      parse: parseDate,
      serialize: (date) => date?.toString() ?? null,
    },
    publishedAtTo: {
      parse: parseDate,
      serialize: (date) => date?.toString() ?? null,
    },
    offersDeadlineFrom: {
      parse: parseDate,
      serialize: (date) => date?.toString() ?? null,
    },
    offersDeadlineTo: {
      parse: parseDate,
      serialize: (date) => date?.toString() ?? null,
    },
    voivodeship: parseAsSet<Voivodeship>(),
    sortBy: parseAsSet<SortDirection>(),
  });

  const { control, handleSubmit, register } = useForm<FilterForm>({
    defaultValues: {
      publishedAt:
        filterQuery.publishedAtFrom && filterQuery.publishedAtTo
          ? {
              start: filterQuery.publishedAtFrom,
              end: filterQuery.publishedAtTo,
            }
          : null,
      offersDeadline:
        filterQuery.offersDeadlineFrom && filterQuery.offersDeadlineTo
          ? {
              start: filterQuery.offersDeadlineFrom,
              end: filterQuery.offersDeadlineTo,
            }
          : null,
      voivodeship: filterQuery.voivodeship,
      sortBy: filterQuery.sortBy,
    },
  });

  const onFilter = handleSubmit((data) => {
    setFilterQuery({
      publishedAtFrom: data.publishedAt?.start,
      publishedAtTo: data.publishedAt?.end,
      offersDeadlineFrom: data.offersDeadline?.start,
      offersDeadlineTo: data.offersDeadline?.end,
      voivodeship: data.voivodeship,
      sortBy: data.sortBy,
    });

    onFiltered?.(data);
  });

  const activeFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];

    if (filterQuery.offersDeadlineFrom) {
      filters.push({
        key: "offersDeadlineFrom",
        label: <span>Deadline From</span>,
        value: format(
          filterQuery.offersDeadlineFrom.toDate(getLocalTimeZone()),
          "dd/MM/yyyy"
        ),
        type: "filter",
      });
    }

    if (filterQuery.offersDeadlineTo) {
      filters.push({
        key: "offersDeadlineTo",
        label: <span>Deadline To</span>,
        value: format(
          filterQuery.offersDeadlineTo.toDate(getLocalTimeZone()),
          "dd/MM/yyyy"
        ),
        type: "filter",
      });
    }

    if (filterQuery.publishedAtFrom) {
      filters.push({
        key: "publishedAtFrom",
        label: <span>Published from</span>,
        value: format(
          filterQuery.publishedAtFrom.toDate(getLocalTimeZone()),
          "dd/MM/yyyy"
        ),
        type: "filter",
      });
    }

    if (filterQuery.publishedAtTo) {
      filters.push({
        key: "publishedAtTo",
        label: <span>Published to</span>,
        value: format(
          filterQuery.publishedAtTo.toDate(getLocalTimeZone()),
          "dd/MM/yyyy"
        ),
        type: "filter",
      });
    }

    if (filterQuery.voivodeship && filterQuery.voivodeship.size > 0) {
      filterQuery.voivodeship.forEach((voivodeship) => {
        const voivodeshipConfig = PolishVoivodeships.find(
          (v) => v.name === voivodeship
        );
        filters.push({
          key: "voivodeship" + voivodeship,
          label: null,
          value: voivodeshipConfig?.label || voivodeship,
          type: "filter",
        });
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
    if (key.startsWith("voivodeship")) {
      const voivodeshipToRemove = key.replace("voivodeship", "");
      const currentVoivodeships = filterQuery.voivodeship || new Set();
      const newVoivodeships = new Set(currentVoivodeships);
      newVoivodeships.delete(voivodeshipToRemove as Voivodeship);

      setFilterQuery({
        ...filterQuery,
        voivodeship: newVoivodeships.size > 0 ? newVoivodeships : null,
      });
      return;
    } else {
      setFilterQuery({
        ...filterQuery,
        [key]: null,
      });
    }
  };

  const addFilter = <T extends keyof FilterForm>(
    key: T,
    value: FilterForm[T]
  ) => {
    setFilterQuery({
      ...filterQuery,
      [key]: value,
    });
  };

  return {
    control,
    register,
    onFilter,
    filterQuery,
    activeFilters,
    removeFilter,
    addFilter,
  };
}
