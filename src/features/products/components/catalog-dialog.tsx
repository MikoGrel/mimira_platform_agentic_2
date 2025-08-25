"use client";

import { useState, type ComponentProps } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "$/components/ui/dialog";
import { CatalogExplorer } from "./catalog-explorer";
import { Package } from "lucide-react";
import { ProductSearchResult } from "../api/use-products-search";
import { Button } from "@heroui/react";

export type CatalogDialogProps = Omit<
  ComponentProps<typeof Dialog>,
  "children"
> & {
  onFinish?: (product: ProductSearchResult) => void;
};

export function CatalogDialog({ onFinish, ...props }: CatalogDialogProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSearchResult | null>(null);

  return (
    <Dialog {...props}>
      <DialogContent
        showCloseButton={false}
        className="md:min-w-3xl xl:min-w-5xl"
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-base flex items-center gap-2">
            <span className="inline-flex items-center shrink-0 justify-center w-6 h-6 rounded-full bg-primary/5 text-primary border border-primary/20">
              <Package className="w-3.5 h-3.5" />
            </span>
            Product catalog explorer
          </DialogTitle>
          <Button
            onPress={() => selectedProduct && onFinish?.(selectedProduct)}
            isDisabled={!selectedProduct}
            size="sm"
            variant="bordered"
          >
            Select product and close
          </Button>
        </DialogHeader>
        <CatalogExplorer
          selectedProduct={selectedProduct}
          onSelected={setSelectedProduct}
        />
      </DialogContent>
    </Dialog>
  );
}
