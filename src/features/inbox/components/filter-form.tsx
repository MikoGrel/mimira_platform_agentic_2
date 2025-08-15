"use client";

import { Button, DateRangePicker, Select, SelectItem } from "@heroui/react";
import { Controller } from "react-hook-form";
import { PolishVoivodeships } from "$/features/i18n/config/poland-config";
import { sortingOptions, useFilterForm } from "../hooks/use-filter-form";
import { FilterFormType } from "..";
import { cn } from "$/lib/utils";

interface FilterFormProps {
  onFiltered?: (filters: FilterFormType) => void;
  className?: string;
}

export function FilterForm({ onFiltered, className }: FilterFormProps) {
  const { control, onFilter } = useFilterForm({ onFiltered });

  return (
    <form onSubmit={onFilter} className={cn("flex flex-col gap-4", className)}>
      <Controller
        control={control}
        name="publishedAt"
        render={({ field, fieldState }) => (
          <DateRangePicker
            {...field}
            errorMessage={fieldState.error?.message}
            label="Published At"
          />
        )}
      />
      <Controller
        control={control}
        name="offersDeadline"
        render={({ field, fieldState }) => (
          <DateRangePicker
            {...field}
            errorMessage={fieldState.error?.message}
            label="Offers Deadline"
          />
        )}
      />
      <Controller
        control={control}
        name="voivodeship"
        render={({ field, fieldState }) => (
          <Select
            selectedKeys={field.value || undefined}
            onSelectionChange={field.onChange}
            label="Voivodeship"
            selectionMode="multiple"
            errorMessage={fieldState.error?.message}
          >
            {PolishVoivodeships.map((voivodeship) => (
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
        render={({ field, fieldState }) => (
          <Select
            selectedKeys={field.value || undefined}
            onSelectionChange={field.onChange}
            label="Sort by offers deadline"
            errorMessage={fieldState.error?.message}
            renderValue={(items) => {
              if (items.length === 0) return null;
              const selectedKey = items[0].key;
              const selectedOption = sortingOptions.find(
                (option) => option.key === selectedKey
              );
              return selectedOption ? selectedOption.readable : null;
            }}
          >
            {sortingOptions.map((sortBy) => (
              <SelectItem key={sortBy.key} startContent={sortBy.readable} />
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
