"use client";

import { Chip } from "@heroui/react";
import { useFilterForm } from "../hooks/use-filter-form";
import { cn } from "$/lib/utils";

export function FilterChips({ className }: { className?: string }) {
  const { activeFilters, removeFilter } = useFilterForm();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2 p-2 pl-0 pb-0 mt-2", className)}>
      {activeFilters.map(({ key, label, value }) => (
        <Chip
          key={key}
          color="primary"
          variant="flat"
          isCloseable
          onClose={() => removeFilter(key)}
        >
          {label && <span>{label}: </span>}
          <span>{value}</span>
        </Chip>
      ))}
    </div>
  );
}
