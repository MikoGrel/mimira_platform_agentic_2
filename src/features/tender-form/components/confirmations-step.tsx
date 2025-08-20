"use client";

import { ProductConfirmation } from "./product-confirmation";
import {
  IndividualTender,
  IndividualTenderPart,
} from "$/features/tenders/api/use-individual-tender";
import React, { useEffect, useState } from "react";

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

  // Check if all products are confirmed and update next button state
  useEffect(() => {
    if (setNextEnabled && isPartItem && item.tender_products) {
      const totalProducts = item.tender_products.length;
      const allConfirmed =
        totalProducts > 0 && confirmedProducts.size >= totalProducts;
      setNextEnabled(allConfirmed);
    } else if (setNextEnabled && !isPartItem) {
      // If not a part item (no products to confirm), enable next button
      setNextEnabled(true);
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
