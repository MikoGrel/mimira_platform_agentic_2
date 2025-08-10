"use client";

import { Tables } from "$/types/supabase";
import { useEffect, useRef, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { useScrollTrigger } from "$/hooks/use-scroll-trigger";
import { AdditionalInfoSection } from "./additional-info-section";
import { DescriptionSection } from "./description-section";
import { NavigationSidebar } from "./navigation-sidebar";
import { RequirementsSection } from "./requirements-section";
import { ReviewCriteriaSection } from "./review-criteria-section";
import { TenderHeader } from "./tender-header";
import { TenderPartsCarousel } from "./tender-parts-carousel";
import { CommentsDrawer } from "$/features/tenders/components";
import { OverviewSection } from "./overview-section";
import { isEmpty } from "lodash";

interface TenderPreviewProps {
  tender?:
    | (Tables<"tenders"> & { tender_parts: Tables<"tender_parts">[] })
    | null;
}

export function TenderPreview({ tender }: TenderPreviewProps) {
  const [commentsOpened, setCommentsOpened] = useState(false);
  const [selectedPart, setSelectedPart] = useQueryState("part", parseAsString);
  const [savedPartIds, setSavedPartIds] = useState<Set<string>>(new Set());
  const item = selectedPart
    ? selectedPart === "overview"
      ? tender
      : tender?.tender_parts.find((part) => part.part_uuid === selectedPart)
    : tender;

  type TenderType = Tables<"tenders"> & {
    tender_parts: Tables<"tender_parts">[];
  };
  type TenderPartType = Tables<"tender_parts">;

  const isPartSelected = !!selectedPart && selectedPart !== "overview";

  function isTenderPart(x: TenderType | TenderPartType): x is TenderPartType {
    return "part_uuid" in x;
  }

  // After the early return below, tender is non-null; ensure we always have a fallback item
  const resolvedItem: TenderType | TenderPartType | null = (item || tender) as
    | TenderType
    | TenderPartType
    | null;

  const descriptionLong = resolvedItem
    ? isTenderPart(resolvedItem)
      ? resolvedItem.description_part_long_llm || ""
      : // tender-level description
        (resolvedItem as TenderType).description_long_llm || ""
    : "";
  const selectedPartName = isPartSelected
    ? tender?.tender_parts.find((part) => part.part_uuid === selectedPart)
        ?.part_name || null
    : null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const isHeaderCollapsed = useScrollTrigger({
    threshold: 100,
    containerRef: scrollRef,
  });

  useEffect(() => {
    // reset saved parts when switching to another tender
    setSavedPartIds(new Set());
    setSelectedPart(null);
  }, [tender?.id, setSelectedPart]);

  // selection persisted via nuqs

  // keep definition single; do not redeclare

  function handleSavePart() {
    if (!isPartSelected || !selectedPart) return;
    setSavedPartIds((prev) => new Set(prev).add(selectedPart));
  }

  function handleFinishApply() {
    // Placeholder for finalization action
    // Could trigger navigation, API call, or toast in future iteration
  }

  function handleUnselectAll() {
    setSavedPartIds(new Set());
  }

  function handleRemoveCurrentPart() {
    if (!selectedPart) return;
    setSavedPartIds((prev) => {
      const next = new Set(prev);
      next.delete(selectedPart);
      return next;
    });
  }

  function handleReject() {
    // Placeholder for reject action
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
        <TenderHeader
          tender={tender}
          isHeaderCollapsed={isHeaderCollapsed}
          setCommentsOpened={setCommentsOpened}
          onSavePart={handleSavePart}
          onFinishApply={handleFinishApply}
          canSavePart={Boolean(selectedPart && selectedPart !== "overview")}
          canFinishApply={savedPartIds.size > 0}
          usePartActions={Boolean(
            tender.tender_parts?.length &&
              selectedPart &&
              selectedPart !== "overview"
          )}
          hasAnySavedParts={savedPartIds.size > 0}
          currentPartIsSaved={Boolean(
            selectedPart && savedPartIds.has(selectedPart)
          )}
          isOverviewSelected={selectedPart === "overview"}
          hasParts={Boolean(tender.tender_parts?.length)}
          onUnselectAll={handleUnselectAll}
          onRemoveCurrentPart={handleRemoveCurrentPart}
          onApplySavedParts={handleFinishApply}
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
                savedPartIds={savedPartIds}
              />
            )}
            <div className="flex-1 overflow-y-auto" ref={scrollRef}>
              <div className="px-6 py-6 space-y-8 max-w-5xl">
                <OverviewSection
                  extra={
                    selectedPartName ? (
                      <span className="font-normal text-gray-500">
                        — {selectedPartName}
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
                <DescriptionSection description_long_llm={descriptionLong} />
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
