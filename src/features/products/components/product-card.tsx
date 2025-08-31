"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { Package, Tag } from "lucide-react";
import { cn } from "$/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "$/components/ui/accordion";
import { InboxTenderProduct } from "$/features/inbox/api/use-tender-inbox-query";
import { CatalogProduct } from "../api/use-catalog-products";
import { truncate } from "lodash-es";

interface ProductCardProps {
  product: InboxTenderProduct;
  alternatives: CatalogProduct[];
  closestMatch: CatalogProduct | null;
  className?: string;
}

export function ProductCard({
  product,
  closestMatch,
  alternatives,
  className,
}: ProductCardProps) {
  const hasLongSpec = (product.product_req_spec?.length || 0) > 40;

  const hasDetails = Boolean(
    product.closest_match ||
      product.requirements_to_confirm ||
      (product.alternative_products as string[])?.length > 0 ||
      hasLongSpec
  );

  return (
    <Card
      shadow="none"
      className={cn(
        "border border-border rounded-lg hover:shadow-sm transition-shadow h-fit",
        className
      )}
    >
      <CardBody className="p-4">
        <Accordion type="single" collapsible disabled={!hasDetails}>
          <AccordionItem value="details">
            <AccordionTrigger className="px-0 py-0 items-center hover:no-underline hover:cursor-pointer">
              <div className="flex w-full items-center justify-between">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center shrink-0 justify-center w-6 h-6 rounded-full bg-primary/5 text-primary border border-primary/20">
                    <Package className="w-3.5 h-3.5" />
                  </span>
                  <span className="inline-flex flex-col">
                    {product.product_req_name}
                    <span className="text-xs text-muted-foreground">
                      {truncate(product.product_req_spec || "", {
                        length: 40,
                      })}
                    </span>
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  {!product.closest_match && (
                    <Chip size="sm" variant="flat" color="warning">
                      No matches
                    </Chip>
                  )}
                  {product.closest_match && (
                    <Chip size="sm" variant="flat" color="success">
                      Matching product
                    </Chip>
                  )}
                  {product.product_req_quantity && (
                    <Chip size="sm" variant="flat">
                      {product.product_req_quantity}
                    </Chip>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0 pt-4 space-y-4">
              {product.product_req_spec && hasLongSpec && (
                <div className="text-sm bg-primary/5 border border-primary/20 rounded-md p-3 leading-relaxed">
                  <span className="inline-flex items-center gap-1 font-medium mb-1">
                    Specification
                  </span>
                  <p className="text-foreground/90 whitespace-pre-wrap mt-1">
                    {product.product_req_spec}
                  </p>
                </div>
              )}

              {product.closest_match && (
                <div className="text-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">
                      Closest match
                    </span>
                  </div>
                  <div>
                    <Tag className="w-4 4 text-success inline mr-1" />
                    {closestMatch?.name}
                  </div>
                </div>
              )}

              {product.requirements_to_confirm && (
                <div className="text-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2 ">
                    <span className="font-medium text-muted-foreground">
                      Requirements to confirm
                    </span>
                  </div>
                  <ul className="space-y-1 pl-2">
                    {product.requirements_to_confirm}
                  </ul>
                </div>
              )}

              {alternatives.length > 0 && (
                <div className="text-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">
                      Alternative products
                    </span>
                  </div>
                  {alternatives.map((p) => (
                    <div key={p.id}>
                      <Tag className="w-4 h-4 text-primary inline mr-1 shrink-0" />
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}
