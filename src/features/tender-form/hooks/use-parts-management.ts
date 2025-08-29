import { useCallback, useEffect, useMemo, useState } from "react";
import { getOverviewParts } from "$/features/tenders/utils/parts";
import type {
  InboxTenderMapping,
  InboxTenderPart,
} from "$/features/inbox/api/use-tender-inbox-query";
import {
  useUpdatePartStatus,
  useUpdateRequirementState,
} from "$/features/tender-form/hooks";

type UsePartsManagementResult = {
  selectedPart: InboxTenderPart | null;
  setSelectedPart: (part: InboxTenderPart | null) => void;
  partsNeedingConfirmation: InboxTenderPart[];
  confirmedParts: Set<string>;
  isProcessingConfirmation: boolean;
  handleConfirmCurrentPart: () => Promise<void>;
  areAllPartsConfirmed: () => boolean;
  areAllPartsExceptCurrentConfirmed: () => boolean;
  getNextPartToConfirm: () => InboxTenderPart | undefined;
  handlePartSelect: (partId: string) => void;
  handleConfirmationsBeforeNext: () => Promise<boolean>;
  confirmationsNextEnabled: boolean;
  initialConfirmationsNextEnabled: boolean;
};

export function usePartsManagement(
  mapping: InboxTenderMapping | null | undefined
): UsePartsManagementResult {
  const [selectedPart, setSelectedPart] = useState<InboxTenderPart | null>(
    null
  );
  const [partsNeedingConfirmation, setPartsNeedingConfirmation] = useState<
    InboxTenderPart[]
  >([]);
  const [confirmedParts, setConfirmedParts] = useState<Set<string>>(new Set());
  const [isProcessingConfirmation, setIsProcessingConfirmation] =
    useState(false);

  const updateRequirementState = useUpdateRequirementState();
  const updatePartStatus = useUpdatePartStatus();

  // Establish parts that need confirmation and initial selected part
  useEffect(() => {
    if (!mapping?.tender_parts) return;

    const analysisParts = mapping.tender_parts.filter(
      (part) => !["default", "reject"].includes(part.status)
    );

    const needing = analysisParts.filter((part) =>
      part.tender_requirements.some((req) => req.status === "default")
    );
    setPartsNeedingConfirmation(needing);

    if (!selectedPart) {
      setSelectedPart(needing[0] || analysisParts[0]);
    }
  }, [mapping, selectedPart]);

  const handleConfirmCurrentPart = useCallback(async (): Promise<void> => {
    if (!selectedPart) return;

    setIsProcessingConfirmation(true);
    try {
      const requirements = selectedPart.tender_requirements || [];
      const defaultRequirements = requirements.filter(
        (req) => req.status === "default"
      );

      if (defaultRequirements.length === 0) return;

      const requirementPromises = defaultRequirements.map((req) =>
        updateRequirementState.mutateAsync({ id: req.id, status: "approve" })
      );

      const partPromise = updatePartStatus.mutateAsync({
        id: selectedPart.id,
        status: "approve",
      });

      await Promise.all([...requirementPromises, partPromise]);
      setConfirmedParts((prev) => new Set(prev).add(selectedPart.id));
    } finally {
      setIsProcessingConfirmation(false);
    }
  }, [selectedPart, updateRequirementState, updatePartStatus]);

  const areAllPartsConfirmed = useCallback((): boolean => {
    return partsNeedingConfirmation.every((part) =>
      confirmedParts.has(part.id)
    );
  }, [partsNeedingConfirmation, confirmedParts]);

  const areAllPartsExceptCurrentConfirmed = useCallback((): boolean => {
    if (!selectedPart) return false;
    return partsNeedingConfirmation
      .filter((part) => part.id !== selectedPart.id)
      .every((part) => confirmedParts.has(part.id));
  }, [selectedPart, confirmedParts, partsNeedingConfirmation]);

  const getNextPartToConfirm = useCallback(() => {
    return partsNeedingConfirmation.find(
      (part) => !confirmedParts.has(part.id)
    );
  }, [partsNeedingConfirmation, confirmedParts]);

  const handlePartSelect = useCallback(
    (partId: string) => {
      if (!mapping) return;
      const overviewParts = getOverviewParts(mapping);
      const part = overviewParts.find((p) => p.id === partId);
      if (!part) return;
      setSelectedPart(part);
    },
    [mapping]
  );

  return useMemo(
    () => ({
      selectedPart,
      setSelectedPart,
      partsNeedingConfirmation,
      confirmedParts,
      isProcessingConfirmation,
      handleConfirmCurrentPart,
      areAllPartsConfirmed,
      areAllPartsExceptCurrentConfirmed,
      getNextPartToConfirm,
      handlePartSelect,
      handleConfirmationsBeforeNext: async () => {
        if (selectedPart && !confirmedParts.has(selectedPart.id)) {
          await handleConfirmCurrentPart();
        }

        if (areAllPartsConfirmed() || areAllPartsExceptCurrentConfirmed()) {
          return true;
        }

        const nextPart = getNextPartToConfirm();
        if (nextPart) {
          setSelectedPart(nextPart);
        }
        return false;
      },
      confirmationsNextEnabled: (() => {
        const currentPartNeedsConfirmation =
          !!selectedPart &&
          partsNeedingConfirmation.some((p) => p.id === selectedPart.id);
        const isCurrentPartConfirmed =
          !!selectedPart && confirmedParts.has(selectedPart.id);
        return Boolean(
          !currentPartNeedsConfirmation ||
            isCurrentPartConfirmed ||
            areAllPartsExceptCurrentConfirmed()
        );
      })(),
      initialConfirmationsNextEnabled: (() => {
        const firstPartNeedsConfirmation =
          partsNeedingConfirmation.length > 0 &&
          !confirmedParts.has(partsNeedingConfirmation[0].id);
        return !firstPartNeedsConfirmation;
      })(),
    }),
    [
      selectedPart,
      partsNeedingConfirmation,
      confirmedParts,
      isProcessingConfirmation,
      handleConfirmCurrentPart,
      areAllPartsConfirmed,
      areAllPartsExceptCurrentConfirmed,
      getNextPartToConfirm,
      handlePartSelect,
    ]
  );
}
