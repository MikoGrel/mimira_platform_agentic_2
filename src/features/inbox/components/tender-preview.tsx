"use client";

import { useMemo, useRef, useState } from "react";
import { AdditionalInfoSection } from "./additional-info-section";
import { NavigationSidebar } from "./navigation-sidebar";
import { RequirementsSection } from "./requirements-section";
import { TenderHeader } from "./tender-header";
import dynamic from "next/dynamic";
import { OverviewSection } from "./overview-section";
import { ProductsSection } from "./products-section";

import { useRejectTender } from "../api/use-reject-tender";
import { getRequirements } from "../utils/compat";
import {
  InboxTenderMapping,
  InboxTenderPart,
} from "../api/use-tender-inbox-query";
import { useUpdateTenderStatus } from "$/features/tenders/api/use-update-tender-status";
import { toast } from "sonner";
import { TenderPartsCarouselSkeleton } from "./tender-parts-carousel-skeleton";
import { Section } from "./navigation-sidebar";
import { useSidebarPopupStore } from "$/features/navigation/store/use-sidebar-popup-store";

const TenderPartsCarousel = dynamic(
  () =>
    import("./tender-parts-carousel").then((mod) => mod.TenderPartsCarousel),
  {
    ssr: false,
    loading: () => <TenderPartsCarouselSkeleton />,
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
  mapping: InboxTenderMapping;
  showNextTender?: () => void;
  selectedPart: InboxTenderPart;
  setSelectedPart: (part: string | null) => void;
}

export function TenderPreview({
  mapping,
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
  const { showSidebarPopup } = useSidebarPopupStore();

  const hasMultipleParts = mapping.tender_parts.length > 1;

  const scrollRef = useRef<HTMLDivElement>(null);

  function handleApprovePart() {
    setApprovedPartIds((prev) => new Set(prev).add(selectedPart.id));
  }

  /**
   * If any part has requirements that are not met, return "analysis"
   * Otherwise, return "approve"
   */
  function getPartsApprovalStatus(parts: InboxTenderPart[]) {
    return parts.some(
      (p) =>
        p.tender_requirements.filter((r) => r.status === "default").length > 0
    )
      ? "analysis"
      : "approve";
  }

  function handleApply(partIds?: string[]) {
    updateTenderStatus({
      status: "analysis",
      mappingId: mapping.id,
      partIds,
      partsStatus: getPartsApprovalStatus(
        mapping.tender_parts.filter((p) => partIds?.includes(p.id))
      ),
    });

    toast.success(
      <span>
        Tender was moved to analysis successfully, go to active tenders to see
        it
      </span>
    );

    showSidebarPopup({
      id: "active-tenders",
      content: (
        <span>
          Tender was moved to analysis successfully, go to active tenders to see
          it
        </span>
      ),
      duration: 3000,
    });

    showNextTender?.();
  }

  function handleUnselectAll() {
    setApprovedPartIds(new Set());
  }

  function handleRemoveCurrentPart() {
    setApprovedPartIds((prev) => {
      const next = new Set(prev);
      next.delete(selectedPart.id);
      return next;
    });
  }

  function handleReject() {
    rejectTender(mapping.id);

    toast.success(
      <span>Tender was rejected successfully, go to archive tab to see it</span>
    );

    showNextTender?.();
  }

  const sections = useMemo(() => {
    return [
      { id: "products", label: <span>Products</span> },
      { id: "requirements", label: <span>Requirements</span> },
      mapping.tenders?.review_criteria_llm
        ? {
            id: "review-criteria",
            label: <span>Review Criteria</span>,
          }
        : null,
      { id: "description", label: <span>Description</span> },
      { id: "others", label: <span>Additional Info</span> },
    ].filter(Boolean) as Section[];
  }, [mapping.tenders?.review_criteria_llm]);

  return (
    <section className="h-full w-full">
      <div className="h-full w-full flex flex-col">
        <TenderHeader
          mapping={mapping}
          containerRef={scrollRef}
          setCommentsOpened={setCommentsOpened}
          onApprovePart={handleApprovePart}
          approvedPartIds={approvedPartIds}
          currentPart={{
            item: selectedPart,
            isApproved: approvedPartIds.has(selectedPart.id),
          }}
          onUnselectAll={handleUnselectAll}
          onRemoveCurrentPart={handleRemoveCurrentPart}
          onApply={handleApply}
          onReject={handleReject}
          hasMultipleParts={hasMultipleParts}
        />

        <div className="flex overflow-hidden h-full flex-[1_0_0]">
          <div className="flex-1 flex flex-col">
            {hasMultipleParts && (
              <div className="border-b sticky top-0 z-30 bg-background px-6">
                <TenderPartsCarousel
                  containerRef={scrollRef}
                  tenderParts={mapping.tender_parts}
                  selectedPart={selectedPart.id}
                  onPartSelect={setSelectedPart}
                  approvedPartIds={approvedPartIds}
                />
              </div>
            )}
            <div className="flex-1 overflow-y-auto bg-sidebar" ref={scrollRef}>
              <div className="px-6 py-6 grid grid-cols-1 gap-6 w-full">
                <OverviewSection
                  title={selectedPart.part_name || mapping.tenders.order_object}
                  canParticipate={Boolean(selectedPart.can_participate)}
                  wadium={selectedPart.wadium_llm || ""}
                  completionDate={selectedPart.ordercompletiondate_llm || ""}
                />

                {selectedPart.tender_products && (
                  <ProductsSection products={selectedPart.tender_products} />
                )}
                <RequirementsSection
                  met_requirements={getRequirements("met", selectedPart)}
                  needs_confirmation_requirements={getRequirements(
                    "needs_confirmation",
                    selectedPart
                  )}
                  not_met_requirements={getRequirements(
                    "not_met",
                    selectedPart
                  )}
                />
                <ReviewCriteriaSection
                  review_criteria_llm={selectedPart.review_criteria_llm}
                />

                <DescriptionSection
                  description_long_llm={
                    selectedPart.description_part_long_llm ||
                    mapping.tenders?.description_long_llm ||
                    ""
                  }
                />

                <AdditionalInfoSection
                  payment_terms_llm={mapping.tenders?.payment_terms_llm || ""}
                  contract_penalties_llm={
                    mapping.tenders?.contract_penalties_llm || ""
                  }
                  deposit_llm={mapping.tenders?.deposit_llm || ""}
                  url={mapping.tenders?.url || ""}
                />
              </div>
            </div>
          </div>

          <NavigationSidebar scrollRef={scrollRef} sections={sections} />

          <CommentsDrawer
            open={commentsOpened}
            setOpen={setCommentsOpened}
            mapping={mapping}
          />
        </div>
      </div>
    </section>
  );
}
