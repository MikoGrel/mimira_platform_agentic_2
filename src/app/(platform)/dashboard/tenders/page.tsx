"use client";

import { useState } from "react";
import {
  Input,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tabs,
  Tab,
} from "@heroui/react";
import { Kanban, List, Search, SlidersHorizontal } from "lucide-react";
import { TenderKanban } from "$/features/tenders/components";
import { useFilterForm } from "$/features/inbox/hooks/use-filter-form";
import { FilterForm, FilterChips } from "$/features/inbox/components";

export default function TendersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { filterQuery, activeFilters } = useFilterForm();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleFilterApplied = () => {
    setIsFiltersOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="w-full border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <Input
              value={searchQuery}
              onValueChange={handleSearch}
              placeholder="Search tenders..."
              startContent={
                <Search className="w-4 h-4 text-muted-foreground" />
              }
              className="w-80"
              size="sm"
              variant="bordered"
            />

            <Popover
              isOpen={isFiltersOpen}
              onOpenChange={setIsFiltersOpen}
              placement="bottom-end"
              showArrow
            >
              <PopoverTrigger>
                <Button
                  variant={activeFilters.length > 0 ? "solid" : "bordered"}
                  size="sm"
                  startContent={<SlidersHorizontal className="w-4 h-4" />}
                >
                  <span>Filter</span>
                  {activeFilters.length > 0 && (
                    <span className="ml-1 bg-white text-primary rounded-full px-2 py-0.5 text-xs">
                      {activeFilters.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-4">
                <FilterForm onFiltered={handleFilterApplied} className="w-96" />
              </PopoverContent>
            </Popover>
          </div>
          <Tabs size="sm">
            <Tab
              key="kanban"
              name="Kanban"
              title={
                <span className="flex items-center gap-1">
                  <Kanban className="w-4 h-4" />
                  Kanban
                </span>
              }
            />
            <Tab
              key="list"
              name="List"
              title={
                <span className="flex items-center gap-1">
                  <List className="w-4 h-4" />
                  List
                </span>
              }
            />
          </Tabs>
        </div>
        <FilterChips />
      </div>

      <div className="flex-1 p-6">
        <TenderKanban searchQuery={searchQuery} filterQuery={filterQuery} />
      </div>
    </div>
  );
}
