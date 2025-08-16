"use client";

import { useMemo, useRef, useState } from "react";
import { useScrollTrigger } from "$/hooks/use-scroll-trigger";
import { AdditionalInfoSection } from "./additional-info-section";
import { NavigationSidebar } from "./navigation-sidebar";
import { RequirementsSection } from "./requirements-section";
import { TenderHeader } from "./tender-header";
import dynamic from "next/dynamic";
import { OverviewSection } from "./overview-section";
import { ProductsSection } from "./products-section";
import { isEmpty } from "lodash-es";
import { useRejectTender } from "../api/use-reject-tender";
import { getRequirements } from "../utils/compat";
import { InboxTender, InboxTenderPart } from "../api/use-tender-inbox-query";
import { useUpdateTenderStatus } from "$/features/tenders/api/use-update-tender-status";
import { toast } from "sonner";

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

const DescriptionSection = dynamic(
  () => import("./description-section").then((mod) => mod.DescriptionSection),
  {
    ssr: false,
  }
);

interface TenderPreviewProps {
  tender: InboxTender;
  showNextTender?: () => void;
  selectedPart: string | null;
  setSelectedPart: (part: string | null) => void;
}

export function TenderPreview({
  tender,
  selectedPart,
  setSelectedPart,
  showNextTender,
}: TenderPreviewProps) {
  const [commentsOpened, setCommentsOpened] = useState(false);
  const [approvedPartIds, setApprovedPartIds] = useState<Set<string>>(
    new Set()
  );
  const { mutate: rejectTender } = useRejectTender();
  const { mutate: updateTenderStatus } = useUpdateTenderStatus();

  const isPartSelected = !!selectedPart && selectedPart !== "overview";
  const hasParts = tender.tender_parts.length > 0;

  function isTenderPart(
    x: InboxTender | InboxTenderPart | null | undefined
  ): x is InboxTenderPart {
    return x !== null && x !== undefined && "part_uuid" in x;
  }

  const resolvedItem = useMemo(() => {
    if (!selectedPart) return tender;

    return tender?.tender_parts.find((part) => part.part_uuid === selectedPart);
  }, [selectedPart, tender]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isHeaderCollapsed = useScrollTrigger({
    threshold: hasParts ? 5 : 60,
    containerRef: scrollRef,
  });

  const showDescription = useMemo(() => {
    if (!isTenderPart(resolvedItem)) return true;
    return resolvedItem.description_part_long_llm !== "";
  }, [resolvedItem]);

  const showReviewCriteria = useMemo(() => {
    if (!isTenderPart(resolvedItem)) return true;
    return resolvedItem.review_criteria_llm !== "";
  }, [resolvedItem]);

  function handleApprovePart() {
    if (!isPartSelected || !selectedPart) return;
    setApprovedPartIds((prev) => new Set(prev).add(selectedPart));
  }

  function handleApply(partIds?: string[]) {
    console.log("applied?");

    updateTenderStatus({
      status: "analysis",
      tenderId: tender.id,
      partIds,
    });

    toast.success(
      <span>
        Tender was moved to analysis successfully, go to active tenders to see
        it
      </span>
    );

    showNextTender?.();
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

    toast.success(
      <span>Tender was rejected successfully, go to archive tab to see it</span>
    );

    showNextTender?.();
  }

  const tenderSections = useMemo(() => {
    return [
      { id: "overview", label: <span>Overview</span> },
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
                  met_requirements={getRequirements("met", resolvedItem)}
                  needs_confirmation_requirements={getRequirements(
                    "needs_confirmation",
                    resolvedItem
                  )}
                  not_met_requirements={getRequirements(
                    "not_met",
                    resolvedItem
                  )}
                />
                {showReviewCriteria && (
                  <ReviewCriteriaSection
                    review_criteria_llm={resolvedItem?.review_criteria_llm}
                  />
                )}

                {showDescription && (
                  <DescriptionSection
                    description_long_llm={
                      isTenderPart(resolvedItem)
                        ? resolvedItem.description_part_long_llm || ""
                        : resolvedItem?.description_long_llm || ""
                    }
                  />
                )}
                {!showDescription && (
                  <p className="text-sm text-muted-foreground italic">
                    No description available
                  </p>
                )}

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
