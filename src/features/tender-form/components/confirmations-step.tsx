"use client";

import React, { useEffect, useState } from "react";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { InboxTenderPart } from "$/features/inbox/api/use-tender-inbox-query";
import { RequirementConfirmation } from "./requirement-confirmation";

/**
 * Determines if the next button should be enabled based on confirmation state
 */
const shouldEnableNextButton = (
  item: InboxTenderMapping | InboxTenderPart | null | undefined,
  confirmedItems: Set<string>
): boolean => {
  if (!item) return true;

  // Get requirements with status "default"
  const requirements =
    "tender_requirements" in item ? item.tender_requirements : [];
  const defaultRequirements = requirements.filter(
    (req) => req.status === "default"
  );

  // Split requirements into product and service requirements
  const productRequirementsData = defaultRequirements.filter(
    (req) => req.tender_product_id
  );
  const serviceRequirements = defaultRequirements.filter(
    (req) => !req.tender_product_id
  );

  // Calculate total items that need confirmation (individual requirements)
  const totalItemsToConfirm =
    productRequirementsData.length + serviceRequirements.length;

  // If no items to confirm, enable next button
  if (totalItemsToConfirm === 0) return true;

  // All items must be confirmed
  return confirmedItems.size >= totalItemsToConfirm;
};

interface ConfirmationsStepProps {
  item: InboxTenderPart | null | undefined;
  setNextEnabled: (enabled: boolean) => void;
  isConfirmed?: boolean;
}

export function ConfirmationsStep({
  item,
  setNextEnabled,
  isConfirmed = false,
}: ConfirmationsStepProps) {
  const [confirmedItems, setConfirmedItems] = useState<Set<string>>(new Set());

  const requirements = item?.tender_requirements || [];
  const defaultRequirements = requirements.filter(
    (req) => req.status === "default"
  );

  const productRequirements = defaultRequirements.filter(
    (req) => req.tender_product_id
  );

  const serviceRequirements = defaultRequirements.filter(
    (req) => !req.tender_product_id
  );

  useEffect(() => {
    if (setNextEnabled) {
      if (isConfirmed) {
        setNextEnabled(true);
        return;
      }

      const enabled = shouldEnableNextButton(item, confirmedItems);
      setNextEnabled(enabled);
    }
  }, [confirmedItems, item, setNextEnabled, isConfirmed]);

  const handleConfirmationChange = (newConfirmedItems: Set<string>) => {
    setConfirmedItems(newConfirmedItems);
  };

  return (
    <section className="h-full w-full">
      <div className="h-full w-full flex flex-col">
        <div className="grid grid-cols-1 gap-6">
          <RequirementConfirmation
            key={item?.id}
            productRequirements={productRequirements}
            serviceRequirements={serviceRequirements}
            onConfirmationChange={handleConfirmationChange}
          />
        </div>
      </div>
    </section>
  );
}
