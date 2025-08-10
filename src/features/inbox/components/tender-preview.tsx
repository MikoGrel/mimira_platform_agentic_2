"use client";

import { Tables } from "$/types/supabase";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { useScrollTrigger } from "$/hooks/use-scroll-trigger";
import { AdditionalInfoSection } from "./additional-info-section";
import { DescriptionSection } from "./description-section";
import { NavigationSidebar } from "./navigation-sidebar";
import { RequirementsSection } from "./requirements-section";
import { ReviewCriteriaSection } from "./review-criteria-section";
import { TenderHeader } from "./tender-header";
import dynamic from "next/dynamic";

import { OverviewSection } from "./overview-section";
import { isEmpty } from "lodash";

const TenderPartsCarousel = dynamic(
  () =>
    import("./tender-parts-carousel").then((mod) => mod.TenderPartsCarousel),
  {
    ssr: false,
  }
);

const CommentsDrawer = dynamic(
  () =>
    import("$/features/tenders/components").then((mod) => mod.CommentsDrawer),
  {
    ssr: false,
  }
);

interface TenderPreviewProps {
  tender: Tables<"tenders"> & { tender_parts: Tables<"tender_parts">[] };
}

export type TenderType = Tables<"tenders"> & {
  tender_parts: Tables<"tender_parts">[];
};
export type TenderPartType = Tables<"tender_parts">;

export function TenderPreview({ tender }: TenderPreviewProps) {
  const [commentsOpened, setCommentsOpened] = useState(false);
  const [selectedPart, setSelectedPart] = useQueryState("part", parseAsString);
  const [approvedPartIds, setApprovedPartIds] = useState<Set<string>>(
    new Set()
  );

  const isPartSelected = !!selectedPart && selectedPart !== "overview";

  function isTenderPart(
    x: TenderType | TenderPartType | null | undefined
  ): x is TenderPartType {
    return x !== null && x !== undefined && "part_uuid" in x;
  }

  const resolvedItem: TenderType | TenderPartType | undefined | null =
    useMemo(() => {
      if (!selectedPart || selectedPart === "overview") return tender;
      return tender?.tender_parts.find(
        (part) => part.part_uuid === selectedPart
      );
    }, [selectedPart, tender]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isHeaderCollapsed = useScrollTrigger({
    threshold: 60,
    containerRef: scrollRef,
  });

  useEffect(() => {
    setApprovedPartIds(new Set());
    setSelectedPart(null);
  }, [tender?.id, setSelectedPart]);

  function handleApprovePart() {
    if (!isPartSelected || !selectedPart) return;
    setApprovedPartIds((prev) => new Set(prev).add(selectedPart));
  }

  function handleFinishApply() {
    // Placeholder for finalization action
    // Could trigger navigation, API call, or toast in future iteration
  }

  function handleUnselectAll() {
    setApprovedPartIds(new Set());
  }

  function handleRemoveCurrentPart() {
    if (!selectedPart) return;
    setApprovedPartIds((prev) => {
      const next = new Set(prev);
      next.delete(selectedPart);
      return next;
    });
  }

  function handleReject() {
    // Placeholder for reject action
  }

  return (
    <section className="h-full w-full">
      <div className="h-full w-full flex flex-col">
        <TenderHeader
          tender={tender}
          isHeaderCollapsed={isHeaderCollapsed}
          setCommentsOpened={setCommentsOpened}
          onApprovePart={handleApprovePart}
          onFinishApply={handleFinishApply}
          canApprovePart={Boolean(selectedPart && selectedPart !== "overview")}
          canFinishApply={approvedPartIds.size > 0}
          hasAnyApprovedParts={approvedPartIds.size > 0}
          currentPart={{
            item: isTenderPart(resolvedItem) ? resolvedItem : null,
            isApproved: Boolean(
              selectedPart && approvedPartIds.has(selectedPart)
            ),
          }}
          onUnselectAll={handleUnselectAll}
          onRemoveCurrentPart={handleRemoveCurrentPart}
          onApplySelectedParts={handleFinishApply}
          onReject={handleReject}
        />

        <div className="flex overflow-hidden h-full flex-[1_0_0]">
          <div className="flex-1 flex flex-col">
            {!isEmpty(tender.tender_parts) && (
              <TenderPartsCarousel
                isCollapsed={isHeaderCollapsed}
                tenderParts={tender.tender_parts}
                selectedPart={selectedPart}
                onPartSelect={setSelectedPart}
                approvedPartIds={approvedPartIds}
              />
            )}
            <div className="flex-1 overflow-y-auto" ref={scrollRef}>
              <div className="px-6 py-6 space-y-8 max-w-5xl">
                <OverviewSection
                  extra={
                    isTenderPart(resolvedItem) ? (
                      <span className="font-normal text-gray-500">
                        — {resolvedItem.part_name}
                      </span>
                    ) : (
                      ""
                    )
                  }
                  canParticipate={Boolean(
                    resolvedItem && resolvedItem.can_participate
                  )}
                  wadium={(resolvedItem && resolvedItem.wadium_llm) || ""}
                  completionDate={
                    (resolvedItem && resolvedItem.ordercompletiondate_llm) || ""
                  }
                />
                <RequirementsSection
                  met_requirements={
                    (resolvedItem?.met_requirements || []) as string[]
                  }
                  needs_confirmation_requirements={
                    (resolvedItem?.needs_confirmation_requirements ||
                      []) as string[]
                  }
                  not_met_requirements={
                    (resolvedItem?.not_met_requirements || []) as string[]
                  }
                />
                <ReviewCriteriaSection
                  review_criteria_llm={
                    (resolvedItem && resolvedItem.review_criteria_llm) || ""
                  }
                />
                <DescriptionSection
                  description_long_llm={
                    isTenderPart(resolvedItem)
                      ? resolvedItem.description_part_long_llm || ""
                      : resolvedItem?.description_long_llm || ""
                  }
                />
                <AdditionalInfoSection
                  application_form_llm={tender.application_form_llm || ""}
                  payment_terms_llm={tender.payment_terms_llm || ""}
                  contract_penalties_llm={tender.contract_penalties_llm || ""}
                  deposit_llm={tender.deposit_llm || ""}
                  url={tender.url || ""}
                />
              </div>
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
