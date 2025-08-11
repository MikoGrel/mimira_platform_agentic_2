"use client";

import { Tables } from "$/types/supabase";
import { Card, CardBody, Chip } from "@heroui/react";
import { ListChecks, Package, Shuffle, Tag } from "lucide-react";
import { cn } from "$/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "$/components/ui/accordion";

interface ProductCardProps {
  product: Tables<"tender_products">;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  function splitToList(text?: string | null): string[] {
    if (!text) return [];
    return text
      .split(/\n|;|•|-\s/)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  const requirementsList = splitToList(product.requirements_to_confirm);
  const alternativesList = splitToList(product.alternative_products);
  const hasDetails = Boolean(
    product.product_req_spec ||
      product.closest_match ||
      requirementsList.length > 0 ||
      alternativesList.length > 0
  );

  return (
    <Card
      shadow="none"
      className={cn(
        "border border-gray-200 rounded-lg hover:shadow-sm transition-shadow h-fit",
        className
      )}
    >
      <CardBody className="p-4">
        {(product.product_req_name || product.product_req_quantity) &&
          !hasDetails && (
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  <Package className="w-3.5 h-3.5" />
                </span>
                {product.product_req_name || "Product"}
              </p>
              {product.closest_match && (
                <Chip size="sm" variant="flat" color="success">
                  Has matching product
                </Chip>
              )}
              {product.product_req_quantity && (
                <Chip size="sm" variant="flat">
                  {product.product_req_quantity}
                </Chip>
              )}
            </div>
          )}
        {hasDetails && (
          <Accordion type="single" collapsible>
            <AccordionItem value="details">
              <AccordionTrigger className="px-0 py-0 items-center">
                <div className="flex w-full items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                      <Package className="w-3.5 h-3.5" />
                    </span>
                    {product.product_req_name || "Product"}
                  </p>
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
              </AccordionTrigger>
              <AccordionContent className="px-0 pt-4 space-y-4">
                {product.product_req_spec && (
                  <div className="text-[13px] bg-blue-50/70 border border-blue-200 rounded-md p-3 leading-relaxed">
                    <span className="inline-flex items-center gap-1 text-gray-700 font-medium mb-1">
                      Specification
                    </span>
                    <p className="text-gray-700 whitespace-pre-wrap mt-1">
                      {product.product_req_spec}
                    </p>
                  </div>
                )}

                {product.closest_match && (
                  <div className="text-[13px] text-gray-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <Tag className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-gray-700">Closest match</span>
                    </div>
                    <div className="pt-2">
                      <span className="inline-flex items-center rounded-md bg-gray-50 text-gray-700 border border-gray-200 px-2 py-0.5">
                        {product.closest_match}
                      </span>
                    </div>
                  </div>
                )}

                {requirementsList.length > 0 && (
                  <div className="text-[13px] text-gray-700 space-y-1">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                        <ListChecks className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-gray-700">
                        Requirements to confirm
                      </span>
                    </div>
                    <ul className="space-y-1 pl-2 pt-2">
                      {requirementsList.map((line, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-gray-700"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {alternativesList.length > 0 && (
                  <div className="text-[13px] text-gray-700 space-y-1">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
                        <Shuffle className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-gray-700">
                        Alternative products
                      </span>
                    </div>
                    <ul className="space-y-1 pl-2 pt-2">
                      {alternativesList.map((line, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-gray-700"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardBody>
    </Card>
  );
}
