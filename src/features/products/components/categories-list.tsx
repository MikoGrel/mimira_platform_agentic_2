"use client";

import { Checkbox } from "$/components/ui/checkbox";
import { Label } from "$/components/ui/label";
import { ScrollArea } from "$/components/ui/scroll-area";
import { useProductCategories } from "../api/use-product-categories";
import { Input, Spinner } from "@heroui/react";
import { Control, Controller } from "react-hook-form";
import { CatalogExplorerFilters } from "./catalog-explorer";
import { useState } from "react";
import { cn } from "$/lib/utils";

interface CategoriesListProps {
  className?: string;
  control: Control<CatalogExplorerFilters>;
}

export const CategoriesList = function CategoriesList({
  className,
  control,
}: CategoriesListProps) {
  const [search, setSearch] = useState("");
  const { categories, loading } = useProductCategories({ search });
  return (
    <ScrollArea className={cn(className, "bg-muted/70 p-2 rounded-md border")}>
      <div className="space-y-2">
        <Input
          className="w-full"
          variant="bordered"
          size="sm"
          placeholder="Search categories"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading && (
          <Spinner size="sm" className="w-full" label="Loading categories..." />
        )}
        <div className="space-y-2">
          <Controller
            name="categories"
            control={control}
            defaultValue={[]}
            render={({ field: { value = [], onChange } }) => (
              <>
                {categories.map((c) => (
                  <div key={c.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={c.id}
                      checked={value.includes(c.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onChange([...value, c.id]);
                        } else {
                          onChange(value.filter((id: string) => id !== c.id));
                        }
                      }}
                    />
                    <Label
                      htmlFor={c.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {c.name}
                    </Label>
                  </div>
                ))}
              </>
            )}
          />
        </div>
      </div>
    </ScrollArea>
  );
};
