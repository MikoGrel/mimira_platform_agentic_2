"use client";

import React, { useEffect, useState } from "react";
import { InboxTenderPart } from "$/features/inbox/api/use-tender-inbox-query";
import { RequirementConfirmation } from "./requirement-confirmation";
import { Package } from "lucide-react";

/**
 * Determines if the next button should be enabled based on confirmation state
 */
const shouldEnableNextButton = (
  item: InboxTenderPart | null | undefined,
  confirmedItems: Set<string>
): boolean => {
  if (!item) return true;
  const requirements = item.tender_requirements || {};
  const defaultRequirements = requirements.filter(
    (req) => req.status === "default"
  );
  const productRequirementsData = defaultRequirements.filter(
    (req) => req.tender_product_id
  );
  const serviceRequirements = defaultRequirements.filter(
    (req) => !req.tender_product_id
  );
  const totalItemsToConfirm =
    productRequirementsData.length + serviceRequirements.length;
  if (totalItemsToConfirm === 0) return true;
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

  if (isConfirmed) {
    return (
      <div className="text-center py-6 text-primary">
        <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
        <p className="text-sm">
          All requirements were confirmed, go to the next step!
        </p>
      </div>
    );
  }

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
