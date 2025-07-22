"use client";

import { Button, DateRangePicker, Select, SelectItem } from "@heroui/react";
import { Controller } from "react-hook-form";
import { PolishVoivodeships } from "$/features/i18n/config/poland-config";
import { sortingOptions, useFilterForm } from "../hooks/use-filter-form";

export function FilterForm() {
  const { control, onFilter } = useFilterForm();

  return (
    <form onSubmit={onFilter} className="flex flex-col gap-4">
      <Controller
        control={control}
        name="dateRange"
        render={({ field }) => (
          <DateRangePicker {...field} label="Date Range" />
        )}
      />
      <Controller
        control={control}
        name="voivodeship"
        render={({ field }) => (
          <Select
            selectedKeys={field.value || undefined}
            onSelectionChange={field.onChange}
            label="Voivodeship"
            selectionMode="multiple"
          >
            {Object.values(PolishVoivodeships).map((voivodeship) => (
              <SelectItem key={voivodeship.name}>
                {voivodeship.label}
              </SelectItem>
            ))}
          </Select>
        )}
      />
      <Controller
        control={control}
        name="sortBy"
        render={({ field }) => (
          <Select
            selectedKeys={field.value || undefined}
            onSelectionChange={field.onChange}
            label="Sort by offers deadline"
          >
            {sortingOptions.map((sortBy) => (
              <SelectItem key={sortBy.key}>{sortBy.label}</SelectItem>
            ))}
          </Select>
        )}
      />
      <Button type="submit" color="primary" size="sm">
        Apply Filters
      </Button>
    </form>
  );
}
