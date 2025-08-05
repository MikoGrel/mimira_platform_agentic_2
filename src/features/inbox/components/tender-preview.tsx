"use client";

import { Tables } from "$/types/supabase";
import { useRef, useState } from "react";
import { useScrollTrigger } from "$/hooks/use-scroll-trigger";
import { AdditionalInfoSection } from "./additional-info-section";
import { DescriptionSection } from "./description-section";
import { NavigationSidebar } from "./navigation-sidebar";
import { OverviewSection } from "./overview-section";
import { RequirementsSection } from "./requirements-section";
import { ReviewCriteriaSection } from "./review-criteria-section";
import { TenderHeader } from "./tender-header";
import { CommentsDrawer } from "$/features/tenders/components";

interface TenderPreviewProps {
  tender?: Tables<"tenders"> | null;
}

export function TenderPreview({ tender }: TenderPreviewProps) {
  const [commentsOpened, setCommentsOpened] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isHeaderCollapsed = useScrollTrigger({
    threshold: 100,
    containerRef: scrollRef,
  });

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
        <TenderHeader
          tender={tender}
          isHeaderCollapsed={isHeaderCollapsed}
          setCommentsOpened={setCommentsOpened}
        />

        <div className="flex overflow-hidden h-full flex-[1_0_0]">
          <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="px-6 py-6 space-y-8 max-w-5xl">
              <OverviewSection tender={tender} />
              <RequirementsSection tender={tender} />
              <ReviewCriteriaSection tender={tender} />
              <DescriptionSection tender={tender} />
              <AdditionalInfoSection tender={tender} />
            </div>
          </div>

          <NavigationSidebar scrollRef={scrollRef} />

          <CommentsDrawer
            open={commentsOpened}
            setOpen={setCommentsOpened}
            tender={tender}
          />
        </div>
      </div>
    </section>
  );
}
