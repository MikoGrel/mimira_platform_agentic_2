"use client";

import { Tables } from "$/types/supabase";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "$/components/ui/button";
import { cn } from "$/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";

interface TenderPartsCarouselProps {
  tenderParts: Tables<"tender_parts">[];
  selectedPart: string | null;
  onPartSelect: (partId: string) => void;
  approvedPartIds: Set<string>;
  isCollapsed: boolean;
}

export function TenderPartsCarousel({
  tenderParts,
  selectedPart,
  onPartSelect,
  approvedPartIds,
  isCollapsed,
}: TenderPartsCarouselProps) {
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

  const isApproved = (part: Tables<"tender_parts">) =>
    approvedPartIds.has(part.part_uuid);

  if (!tenderParts?.length) return null;

  return (
    <div className="border-b sticky top-0 z-30 bg-white">
      <div
        className={`grid grid-cols-1 gap-0 px-6 ${isCollapsed ? "py-2" : "py-4"} ${isCollapsed ? "relative" : ""}`}
      >
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Tender Parts ({tenderParts.length})
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
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 z-10 bg-white backdrop-blur-sm shadow-md hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 z-10 bg-white backdrop-blur-sm shadow-md hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        <div className="min-w-0">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-3 py-2 pl-0.5 pr-0.5">
              <div className="flex-[0_0_200px]">
                <Card
                  isPressable
                  isHoverable
                  shadow="sm"
                  className={cn(
                    "cursor-pointer transition-all duration-200 h-full",
                    selectedPart === "overview" ||
                      (!selectedPart && "ring ring-primary")
                  )}
                  onPress={() => onPartSelect("overview")}
                >
                  <CardHeader className="pb-1 px-3 pt-3">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="font-medium text-sm">Overview</h3>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0 px-3 pb-3">
                    <p className="text-xs text-gray-600">
                      General information about this tender
                    </p>
                  </CardBody>
                </Card>
              </div>

              {tenderParts.map((part, index) => (
                <div key={part.part_uuid} className="flex-[0_0_240px]">
                  <Card
                    isPressable
                    isHoverable
                    shadow="sm"
                    className={cn(
                      "cursor-pointer transition-all duration-200 h-full",
                      selectedPart === part.part_uuid && "ring ring-primary"
                    )}
                    onPress={() => onPartSelect(part.part_uuid)}
                  >
                    <CardHeader className="pb-1 px-3 pt-3 flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1">
                          {approvedPartIds.has(part.part_uuid) && (
                            <Check className="w-3 h-3 text-blue-600" />
                          )}
                          <h3
                            className={cn("text-muted-foreground", {
                              "text-primary": isApproved(part),
                            })}
                          >
                            Part #{index + 1}
                          </h3>
                        </div>
                      </div>
                      <h4 className="text-left line-clamp-2 text-font-base font-semibold w-full">
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
                        <div className="text-xs w-full">
                          <span className="inline">Requirements:</span>
                          <div className="gap-1 inline-flex ml-1">
                            <span className="text-green-600 font-medium">
                              {part.met_requirements?.length || 0}
                            </span>
                            <span className="text-gray-400">/</span>
                            <span className="text-warning-600 font-medium">
                              {(part.met_requirements?.length || 0) +
                                (part.needs_confirmation_requirements?.length ||
                                  0) +
                                (part.not_met_requirements?.length || 0)}
                            </span>
                          </div>
                        </div>

                        {part.wadium_llm && (
                          <div className="text-xs w-full">
                            <span className="inline">Wadium: </span>
                            <span className="font-medium text-left">
                              {part.wadium_llm}
                            </span>
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
    </div>
  );
}
