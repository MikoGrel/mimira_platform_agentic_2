"use client";

import { Tables } from "$/types/supabase";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { useScrollTrigger } from "$/hooks/use-scroll-trigger";
import { AdditionalInfoSection } from "./additional-info-section";
import { DescriptionSection } from "./description-section";
import { NavigationSidebar } from "./navigation-sidebar";
import { RequirementsSection } from "./requirements-section";
import { TenderHeader } from "./tender-header";
import dynamic from "next/dynamic";
import { OverviewSection } from "./overview-section";
import { ProductsSection } from "./products-section";
import { isEmpty } from "lodash";
import { useRejectTender } from "../api/use-reject-tender";
import { PartsWithProducts } from "$/features/tenders/types/parts";

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

const ReviewCriteriaSection = dynamic(
  () =>
    import("./review-criteria-section").then(
      (mod) => mod.ReviewCriteriaSection
    ),
  {
    ssr: false,
  }
);

interface TenderPreviewProps {
  tender: Tables<"tenders"> & { tender_parts: PartsWithProducts[] };
}

export type TenderType = Tables<"tenders"> & {
  tender_parts: Tables<"tender_parts">[];
};
export type TenderPartType = Tables<"tender_parts"> & {
  tender_products?: Tables<"tender_products">[];
};

export function TenderPreview({ tender }: TenderPreviewProps) {
  const [commentsOpened, setCommentsOpened] = useState(false);
  const [selectedPart, setSelectedPart] = useQueryState("part", parseAsString);
  const [approvedPartIds, setApprovedPartIds] = useState<Set<string>>(
    new Set()
  );
  const { mutate: rejectTender } = useRejectTender();

  const isPartSelected = !!selectedPart && selectedPart !== "overview";
  const hasParts = tender.tender_parts.length > 0;

  function isTenderPart(
    x: TenderType | TenderPartType | null | undefined
  ): x is TenderPartType {
    return x !== null && x !== undefined && "part_uuid" in x;
  }

  const resolvedItem: TenderType | TenderPartType | undefined | null =
    useMemo(() => {
      if (!selectedPart) return tender;

      return tender?.tender_parts.find(
        (part) => part.part_uuid === selectedPart
      );
    }, [selectedPart, tender]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isHeaderCollapsed = useScrollTrigger({
    threshold: hasParts ? 5 : 60,
    containerRef: scrollRef,
  });

  useEffect(() => {
    if (selectedPart) return;

    setApprovedPartIds(new Set());
    // Select first part by default if tender has parts
    if (tender?.tender_parts?.length > 0) {
      setSelectedPart(tender.tender_parts[0].part_uuid);
    } else {
      setSelectedPart(null);
    }
  }, [tender?.id, setSelectedPart, tender?.tender_parts, selectedPart]);

  function handleApprovePart() {
    if (!isPartSelected || !selectedPart) return;
    setApprovedPartIds((prev) => new Set(prev).add(selectedPart));
  }

  function handleApply(partIds?: string[]) {
    // Placeholder for finalization action
    // Could trigger navigation, API call, or toast in future iteration
    console.log("apply", partIds);
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
    rejectTender(tender.id);
  }

  const tenderSections = useMemo(() => {
    return [
      { id: "overview", label: <span>Overview</span> },
      { id: "products", label: <span>Products</span> },
      { id: "requirements", label: <span>Requirements</span> },
      { id: "review-criteria", label: <span>Review Criteria</span> },
      { id: "description", label: <span>Description</span> },
      { id: "others", label: <span>Additional Info</span> },
    ];
  }, []);

  const partSections = useMemo(() => {
    return [
      { id: "products", label: <span>Products</span> },
      { id: "requirements", label: <span>Requirements</span> },
      { id: "description", label: <span>Description</span> },
      { id: "others", label: <span>Additional Info</span> },
    ];
  }, []);

  return (
    <section className="h-full w-full">
      <div className="h-full w-full flex flex-col">
        <TenderHeader
          tender={tender}
          isHeaderCollapsed={isHeaderCollapsed}
          setCommentsOpened={setCommentsOpened}
          onApprovePart={handleApprovePart}
          approvedPartIds={approvedPartIds}
          currentPart={{
            item: isTenderPart(resolvedItem) ? resolvedItem : null,
            isApproved: Boolean(
              selectedPart && approvedPartIds.has(selectedPart)
            ),
          }}
          onUnselectAll={handleUnselectAll}
          onRemoveCurrentPart={handleRemoveCurrentPart}
          onApply={handleApply}
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
              <div className="px-6 py-6 grid grid-cols-1 gap-6 w-full">
                {!isTenderPart(resolvedItem) && (
                  <OverviewSection
                    title={
                      isTenderPart(resolvedItem) ? resolvedItem.part_name : null
                    }
                    canParticipate={Boolean(
                      resolvedItem && resolvedItem.can_participate
                    )}
                    wadium={(resolvedItem && resolvedItem.wadium_llm) || ""}
                    completionDate={
                      (resolvedItem && resolvedItem.ordercompletiondate_llm) ||
                      ""
                    }
                  />
                )}

                {isTenderPart(resolvedItem) &&
                  resolvedItem.tender_products &&
                  resolvedItem.tender_products.length > 0 && (
                    <ProductsSection products={resolvedItem.tender_products} />
                  )}
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
                {!isTenderPart(resolvedItem) && (
                  <ReviewCriteriaSection
                    review_criteria_llm={resolvedItem?.review_criteria_llm}
                  />
                )}
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

          <NavigationSidebar
            scrollRef={scrollRef}
            sections={
              isTenderPart(resolvedItem) ? partSections : tenderSections
            }
          />

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
