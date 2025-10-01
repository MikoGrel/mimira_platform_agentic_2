"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "$/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

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

const ChatbotDrawer = dynamic(
  () =>
    import("$/features/tenders/components").then((mod) => mod.ChatbotDrawer),
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
  openChatSignal?: number;
}

export function TenderPreview({
  mapping,
  selectedPart,
  setSelectedPart,
  showNextTender,
  openChatSignal,
}: TenderPreviewProps) {
  const router = useRouter();

  const [commentsOpened, setCommentsOpened] = useState(false);
  const [chatOpened, setChatOpened] = useState(false);
  const [approvedPartIds, setApprovedPartIds] = useState<Set<string>>(
    new Set()
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingPartIds, setPendingPartIds] = useState<string[] | undefined>(
    undefined
  );
  const { mutate: rejectTender } = useRejectTender();
  const { mutate: updateTenderStatus } = useUpdateTenderStatus();
  const { showSidebarPopup } = useSidebarPopupStore();

  const participatingParts = useMemo(
    () => mapping.tender_parts.filter((part) => part.can_participate),
    [mapping.tender_parts]
  );
  const shouldUsePartLevelDescription = participatingParts.length > 1;
  const hasMultipleParts = participatingParts.length > 1;

  const tenderLevelDescription = mapping.tenders?.description_long_llm || "";
  const partLevelDescription =
    selectedPart.description_part_long_llm?.trim() || "";
  const descriptionForSection = shouldUsePartLevelDescription
    ? partLevelDescription || tenderLevelDescription
    : tenderLevelDescription || partLevelDescription;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openChatSignal && openChatSignal > 0) {
      setChatOpened(true);
    }
  }, [openChatSignal]);

  function handleApprovePart() {
    setApprovedPartIds((prev) => new Set(prev).add(selectedPart.id));
  }

  function handleApply(partIds?: string[]) {
    setPendingPartIds(partIds);
    setConfirmDialogOpen(true);
  }

  function confirmApply() {
    updateTenderStatus({
      status: "documents_preparing",
      mappingId: mapping.id,
      partIds: pendingPartIds,
      partsStatus: "approve",
      requirementStatus: {
        from: "default",
        to: "approve",
      },
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

    setConfirmDialogOpen(false);
    setPendingPartIds(undefined);

    router.push(`/dashboard/tenders/${mapping.id}`);
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

  const hasDescriptionSection = descriptionForSection.trim().length > 0;

  const sections = [
    {
      id: "products",
      label: <span>Products</span>,
      enabled: (selectedPart.tender_products?.length ?? 0) > 0,
    },
    {
      id: "requirements",
      label: <span>Requirements</span>,
      enabled: selectedPart.tender_requirements.length > 0,
    },
    {
      id: "review-criteria",
      label: <span>Review Criteria</span>,
      enabled: !!selectedPart.review_criteria_llm,
    },
    {
      id: "description",
      label: <span>Description</span>,
      enabled: hasDescriptionSection,
    },
    {
      id: "others",
      label: <span>Additional Info</span>,
      enabled: !!(
        selectedPart.payment_terms_llm || mapping.tenders?.payment_terms_llm
      ),
    },
  ]
    .filter((section) => section.enabled)
    .map((section) => ({
      id: section.id,
      label: section.label,
    })) as Section[];

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
          setChatOpened={setChatOpened}
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
                  voievodeship={mapping.tenders.voivodship || ""}
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
                  description_long_llm={descriptionForSection}
                />

                <AdditionalInfoSection
                  key={mapping.id}
                  payment_terms_llm={
                    selectedPart?.payment_terms_llm ||
                    mapping.tenders?.payment_terms_llm ||
                    ""
                  }
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
          <ChatbotDrawer
            key={mapping.id ?? "inbox-chatbot"}
            open={chatOpened}
            setOpen={setChatOpened}
            mappingId={mapping.id}
            tenderTitle={
              mapping.tenders.order_object ||
              mapping.tenders?.order_object ||
              ""
            }
          />
        </div>
      </div>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <span data-lingo-override-pl="Aplikuj na ten przetarg">
                Apply to this Tender
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span>
                Do you confirm all requirements? The next step will start
                generating documents.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <span>Cancel</span>
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmApply}>
              <span>Confirm Application</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
