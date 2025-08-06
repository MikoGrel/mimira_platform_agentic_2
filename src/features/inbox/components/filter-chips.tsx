"use client";

import { Chip } from "@heroui/react";
import { useFilterForm } from "../hooks/use-filter-form";

export function FilterChips() {
  const { activeFilters, removeFilter } = useFilterForm();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 pb-0 mt-2">
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
