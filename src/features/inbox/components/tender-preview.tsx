"use client";

import { Tables } from "$/types/supabase";
import { useRef } from "react";
import { useScrollTrigger } from "$/hooks/use-scroll-trigger";
import { Skeleton } from "@heroui/react";
import { AdditionalInfoSection } from "./additional-info-section";
import { DescriptionSection } from "./description-section";
import { NavigationSidebar } from "./navigation-sidebar";
import { OverviewSection } from "./overview-section";
import { RequirementsSection } from "./requirements-section";
import { ReviewCriteriaSection } from "./review-criteria-section";
import { TenderHeader } from "./tender-header";

interface TenderPreviewProps {
  tender?: Tables<"tenders"> | null;
  isLoading?: boolean;
}

export function TenderPreview({ tender, isLoading }: TenderPreviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHeaderCollapsed = useScrollTrigger({
    threshold: 100,
    containerRef: scrollRef,
  });

  if (isLoading) {
    return (
      <section className="h-full w-full">
        <div className="h-full w-full flex flex-col">
          <div className="border-b border-sidebar-border px-6 py-4">
            <Skeleton className="h-8 w-3/4 rounded-lg mb-2" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
          </div>
          <div className="px-6 py-6 space-y-8">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (!tender) {
    return (
      <section className="sticky top-0 flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-sm">Select a tender to view details</p>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full w-full">
      <div className="h-full w-full flex flex-col">
        <TenderHeader tender={tender} isHeaderCollapsed={isHeaderCollapsed} />

        <div className="flex overflow-hidden h-full flex-[1_0_0]">
          <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="px-6 py-6 space-y-8">
              <OverviewSection tender={tender} />
              <RequirementsSection tender={tender} />
              <ReviewCriteriaSection tender={tender} />
              <DescriptionSection tender={tender} />
              <AdditionalInfoSection tender={tender} />
            </div>
          </div>

          <NavigationSidebar scrollRef={scrollRef} />
        </div>
      </div>
    </section>
  );
}
