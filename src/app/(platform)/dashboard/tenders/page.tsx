"use client";

import { useState } from "react";
import { Input, Button } from "@heroui/react";
import { Search, SlidersHorizontal } from "lucide-react";
import { TenderKanban } from "$/features/tenders/components";

export default function TendersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // TODO: Implement search functionality
  };

  const handleFilter = () => {
    // TODO: Implement filter modal/dropdown
    console.log("Filter clicked");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="w-full border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-start gap-2">
          <Input
            value={searchQuery}
            onValueChange={handleSearch}
            placeholder="Search tenders..."
            startContent={<Search className="w-4 h-4 text-muted-foreground" />}
            className="w-80"
            size="sm"
            variant="bordered"
          />
          <Button
            onPress={handleFilter}
            variant="bordered"
            size="sm"
            startContent={<SlidersHorizontal className="w-4 h-4" />}
          >
            Filter
          </Button>
        </div>
      </div>
      <div className="flex-1 p-6">
        <TenderKanban />
      </div>
    </div>
  );
}
