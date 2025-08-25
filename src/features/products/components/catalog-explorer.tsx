"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "$/components/ui/resizable";
import { useInfiniteList } from "$/hooks/use-infinite-list";
import { Card, CardBody, Input, Radio, RadioGroup } from "@heroui/react";
import { useProductsSearch } from "../api/use-products-search";
import { ScrollArea } from "$/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { cn } from "$/lib/utils";
import { CategoriesList } from "./categories-list";
import { ProductSearchResult } from "../api/use-products-search";

export type CatalogExplorerFilters = {
  search: string;
  categories: string[];
};

export function CatalogExplorer({
  className,
  onSelected,
  selectedProduct,
}: {
  className?: string;
  onSelected: (product: ProductSearchResult) => void;
  selectedProduct: ProductSearchResult | null;
}) {
  const { register, watch, control } = useForm<CatalogExplorerFilters>({
    defaultValues: {
      search: "",
      categories: [],
    },
  });

  const { fetchNextPage, hasNextPage, products } = useProductsSearch(watch());

  const { getRef } = useInfiniteList({
    pageSize: 10,
    onIntersect: () => hasNextPage && fetchNextPage(),
  });

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn("w-full h-full", className)}
    >
      <ResizablePanel defaultSize={40} className="pr-4 pt-4 border-t">
        <form className="flex flex-col">
          <Input
            {...register("search")}
            placeholder="Search for a product"
            size="sm"
            variant="bordered"
            className="w-full mb-2 flex-shrink-0"
          />
          <CategoriesList className="h-[550px]" control={control} />
        </form>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60} className="pt-2 border-t">
        <ScrollArea className="h-[600px] flex flex-col">
          <RadioGroup
            classNames={{
              wrapper: "gap-0",
            }}
            onValueChange={(value) => {
              const product = products.find((p) => p.id === value);
              if (product) {
                onSelected(product);
              }
            }}
            value={selectedProduct?.id ?? undefined}
          >
            {products.map((p, i) => (
              <Card
                isPressable
                key={p.id}
                ref={getRef(i)}
                radius="none"
                shadow="none"
                className="w-full"
                onPress={() => onSelected(p)}
              >
                <CardBody className="text-sm border-b border-sidebar-border flex flex-col gap-1.5">
                  <p className="text-xs text-muted-foreground">
                    {p.subcategory?.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <Radio size="sm" value={p.id} />
                    {p.name}
                  </div>
                </CardBody>
              </Card>
            ))}
          </RadioGroup>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
