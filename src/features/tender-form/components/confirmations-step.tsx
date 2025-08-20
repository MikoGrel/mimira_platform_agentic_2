"use client";

import { ProductConfirmation } from "./product-confirmation";
import {
  IndividualTender,
  IndividualTenderPart,
} from "$/features/tenders/api/use-individual-tender";
import React, { useEffect, useState } from "react";

/**
 * Determines if the next button should be enabled based on confirmation state
 */
const shouldEnableNextButton = (
  item: IndividualTender | IndividualTenderPart | null | undefined,
  confirmedProducts: Set<string>,
  isPartItem: boolean
): boolean => {
  // If not a part item (no products to confirm), enable next button
  if (!isPartItem) {
    return true;
  }

  // For part items, check if all products are confirmed
  if (isPartItem && item && "tender_products" in item && item.tender_products) {
    const totalProducts = item.tender_products.length;
    return totalProducts > 0 && confirmedProducts.size >= totalProducts;
  }

  // Default to false if conditions are not met
  return false;
};

interface ConfirmationsStepProps {
  item: IndividualTender | IndividualTenderPart | null | undefined;
  onConfirmationChange?: (confirmedProducts: Set<string>) => void;
  setNextEnabled?: (enabled: boolean) => void;
  onNextHandler?: React.MutableRefObject<(() => Promise<void>) | null>;
}

export function ConfirmationsStep({
  item,
  onConfirmationChange,
  setNextEnabled,
  onNextHandler: _onNextHandler, // eslint-disable-line @typescript-eslint/no-unused-vars
}: ConfirmationsStepProps) {
  const [confirmedProducts, setConfirmedProducts] = useState<Set<string>>(
    new Set()
  );

  const isTenderPart = (x: typeof item): x is IndividualTenderPart =>
    x !== null && x !== undefined && "part_uuid" in x;

  const isPartItem = isTenderPart(item);

  // Update next button state based on confirmation status
  useEffect(() => {
    if (setNextEnabled) {
      const enabled = shouldEnableNextButton(
        item,
        confirmedProducts,
        isPartItem
      );
      setNextEnabled(enabled);
    }
  }, [confirmedProducts, item, isPartItem, setNextEnabled]);

  const handleConfirmationChange = (newConfirmedProducts: Set<string>) => {
    setConfirmedProducts(newConfirmedProducts);
    onConfirmationChange?.(newConfirmedProducts);
  };

  return (
    <div className="space-y-8">
      {isPartItem && item.tender_products?.length > 0 && (
        <ProductConfirmation
          products={item.tender_products}
          onConfirmationChange={handleConfirmationChange}
        />
      )}
      {isPartItem &&
        (!item.tender_products || item.tender_products.length === 0) && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No products found for this part</p>
          </div>
        )}
    </div>
  );
}
