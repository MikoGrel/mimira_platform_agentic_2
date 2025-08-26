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

  // Get product requirements
  const productRequirements =
    "tender_products" in item ? item.tender_products : [];

  // Get service requirements (those without tender_product_id)
  const serviceRequirements = defaultRequirements.filter(
    (req) => !req.tender_product_id
  );

  // Calculate total items that need confirmation
  const totalItemsToConfirm =
    productRequirements.length + serviceRequirements.length;

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

  const productRequirements = item?.tender_products || [];
  const serviceRequirements = defaultRequirements
    .filter((req) => !req.tender_product_id)
    .map((req) => ({
      id: req.id.toString(),
      requirement_text: req.requirement_text,
      reason: req.reason || undefined,
    }));

  useEffect(() => {
    if (setNextEnabled) {
      // If the part is already confirmed globally, enable the next button
      if (isConfirmed) {
        setNextEnabled(true);
        return;
      }

      // Otherwise, check local confirmation state
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
            products={productRequirements}
            serviceRequirements={serviceRequirements}
            onConfirmationChange={handleConfirmationChange}
          />
        </div>
      </div>
    </section>
  );
}
