"use client";

import { useEffect } from "react";
import { AdditionalInfoSection } from "$/features/inbox/components/additional-info-section";
import { RequirementsSection } from "$/features/inbox/components/requirements-section";
import dynamic from "next/dynamic";
import { ProductsSection } from "$/features/inbox/components/products-section";
import { getRequirements } from "$/features/inbox/utils/compat";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { TenderListItemPart } from "$/features/tenders/api/use-tenders-list";

const ReviewCriteriaSection = dynamic(
  () =>
    import("$/features/inbox/components/review-criteria-section").then(
      (mod) => mod.ReviewCriteriaSection
    ),
  {
    ssr: false,
  }
);

const DescriptionSection = dynamic(
  () =>
    import("$/features/inbox/components/description-section").then(
      (mod) => mod.DescriptionSection
    ),
  {
    ssr: false,
  }
);

interface OverviewStepProps {
  mapping: InboxTenderMapping | null | undefined;
  setNextEnabled?: (enabled: boolean) => void;
  selectedPart: TenderListItemPart | null | undefined;
}

export function OverviewStep({
  mapping,
  setNextEnabled,
  selectedPart,
}: OverviewStepProps) {
  useEffect(() => setNextEnabled?.(true), [setNextEnabled]);

  console.log(selectedPart);

  if (!mapping) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">No tender data available</p>
      </div>
    );
  }

  if (!selectedPart) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">No parts available for overview</p>
      </div>
    );
  }

  return (
    <section className="h-full w-full">
      <div className="h-full w-full flex flex-col">
        <div className="grid grid-cols-1 gap-6">
          {selectedPart.tender_products?.length > 0 && (
            <ProductsSection products={selectedPart.tender_products} />
          )}

          <RequirementsSection
            met_requirements={getRequirements("met", selectedPart)}
            needs_confirmation_requirements={getRequirements(
              "needs_confirmation",
              selectedPart
            )}
            not_met_requirements={getRequirements("not_met", selectedPart)}
          />

          {selectedPart.review_criteria_llm && (
            <ReviewCriteriaSection
              review_criteria_llm={selectedPart.review_criteria_llm}
            />
          )}

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
    </section>
  );
}
