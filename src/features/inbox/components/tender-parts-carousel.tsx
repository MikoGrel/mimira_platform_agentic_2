"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleQuestionMark,
  X,
} from "lucide-react";
import { Button } from "$/components/ui/button";
import { cn } from "$/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState, type RefObject } from "react";
import { motion } from "motion/react";
import { InboxTenderPart } from "../api/use-tender-inbox-query";
import { useScrollTrigger } from "$/hooks/use-scroll-trigger";

interface TenderPartsCarouselProps {
  title?: string;
  tenderParts: InboxTenderPart[];
  selectedPart: string | null;
  onPartSelect: (partId: string) => void;
  approvedPartIds: Set<string>;
  containerRef?: RefObject<HTMLElement | null>;
  className?: string;
}

function RequirementsStatus(props: {
  default: number;
  reject: number;
  approve: number;
}) {
  return (
    <div className="gap-1 inline-flex ml-1">
      <span className="text-success-600 font-medium flex items-center gap-1">
        {props.approve || 0}
        <Check className="w-3 h-3 inline-block" />
      </span>
      <span className="text-subtle-foreground">/</span>
      <span className="text-warning-600 font-medium flex items-center gap-1">
        {props.default || 0}
        <CircleQuestionMark className="w-3 h-3 inline-block" />{" "}
      </span>
      <span className="text-subtle-foreground">/</span>
      <span className="text-danger-600 font-medium flex items-center gap-1">
        {props.reject || 0}
        <X className="w-3 h-3 inline-block" />
      </span>
    </div>
  );
}

function ProductStatus({
  totalProducts,
  matchedProducts,
}: {
  totalProducts: number;
  matchedProducts: number;
}) {
  return (
    <div className="gap-1 inline-flex ml-1">
      <span className="text-success-600 font-medium">{matchedProducts}</span>
      <span className="text-subtle-foreground">/</span>
      <span className="text-warning-600 font-medium">{totalProducts}</span>
    </div>
  );
}

export function TenderPartsCarousel({
  title,
  tenderParts,
  selectedPart,
  onPartSelect,
  approvedPartIds,
  containerRef,
  className,
}: TenderPartsCarouselProps) {
  const isCollapsed = useScrollTrigger({ threshold: 60, containerRef });
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const isApproved = (part: InboxTenderPart) => approvedPartIds.has(part.id);

  const totalProducts = (part: InboxTenderPart) => {
    return part.tender_products?.length || 0;
  };

  const matchedProducts = (part: InboxTenderPart) => {
    return part.tender_products?.filter((product) =>
      Boolean(product.closest_match)
    ).length;
  };

  if (!tenderParts?.length) return null;

  const groupedRequirements = (part: InboxTenderPart) => {
    return part.tender_requirements?.reduce(
      (acc, requirement) => {
        const status = requirement.status as "default" | "reject" | "approve";
        if (!acc[status]) {
          acc[status] = 0;
        }
        acc[status]++;
        return acc;
      },
      {} as Record<"default" | "reject" | "approve", number>
    );
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-0",
        isCollapsed ? "py-2" : "py-4",
        isCollapsed ? "relative" : "",
        className
      )}
    >
      {!isCollapsed && (
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {title ? (
              <>{title}</>
            ) : (
              <>Matched tender parts ({tenderParts.length})</>
            )}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isCollapsed && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 z-10 bg-background backdrop-blur-sm shadow-md hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 z-10 bg-background backdrop-blur-sm shadow-md hover:bg-background"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      <div className="min-w-0">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3 py-2 pl-0.5 pr-0.5">
            {tenderParts
              .toSorted((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0))
              .map((part, index) => (
                <div key={part.id} className="flex-[0_0_240px]">
                  <Card
                    isPressable
                    isHoverable
                    shadow="sm"
                    className={cn(
                      "cursor-pointer transition-all duration-200 h-full w-full",
                      selectedPart === part.id && "ring ring-primary/70"
                    )}
                    onPress={() => onPartSelect(part.id)}
                  >
                    <CardHeader className="pb-1 px-3 pt-3 flex flex-col gap-1 text-xs">
                      <h4 className="text-left line-clamp-2 text-font-base w-full">
                        {isApproved(part) && (
                          <Check className="w-3 h-3 text-primary inline-block mr-1" />
                        )}
                        <span className="font-semibold">#{index + 1}</span>{" "}
                        {part.part_name?.trim()}
                      </h4>
                    </CardHeader>
                    <CardBody className="pt-0 px-3 pb-3 text-muted-foreground">
                      <motion.div
                        className="overflow-hidden"
                        animate={{
                          height: isCollapsed ? "0px" : "auto",
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                      >
                        <div className="text-xs w-full flex items-center">
                          <span className="inline">Requirements:</span>
                          <RequirementsStatus {...groupedRequirements(part)} />
                        </div>
                        {totalProducts(part) > 0 && (
                          <div className="text-xs w-full">
                            <span className="inline">Products:</span>
                            <ProductStatus
                              matchedProducts={matchedProducts(part)}
                              totalProducts={totalProducts(part)}
                            />
                          </div>
                        )}
                      </motion.div>
                    </CardBody>
                  </Card>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
