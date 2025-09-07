import { useCallback, useMemo, useState } from "react";
import type {
  InboxTenderMapping,
  InboxTenderPart,
} from "$/features/inbox/api/use-tender-inbox-query";
import {
  useUpdatePartStatus,
  useUpdateRequirementState,
} from "$/features/tender-form/hooks";

type UseConfirmationsManagementResult = {
  confirmedParts: Set<string>;
  isProcessingConfirmation: boolean;
  handleContinue: () => Promise<boolean>;
  partsNeedingConfirmation: InboxTenderPart[];
  setSelectedPart: (part: InboxTenderPart | null) => void;
};

export function useConfirmationsManagement(
  mapping: InboxTenderMapping | null | undefined,
  selectedPart: InboxTenderPart | null,
  setSelectedPart: (part: InboxTenderPart | null) => void
): UseConfirmationsManagementResult {
  const [sessionConfirmedParts, setSessionConfirmedParts] = useState<
    Set<string>
  >(new Set());
  const [isProcessingConfirmation, setIsProcessingConfirmation] =
    useState(false);

  const updateRequirementState = useUpdateRequirementState();
  const updatePartStatus = useUpdatePartStatus();

  const confirmedParts = useMemo(() => {
    const dbConfirmed = new Set(
      mapping?.tender_parts
        ?.filter((part) => part.status === "approve")
        ?.map((part) => part.id) || []
    );
    return new Set([...dbConfirmed, ...sessionConfirmedParts]);
  }, [mapping, sessionConfirmedParts]);

  const partsNeedingConfirmation = useMemo(() => {
    if (!mapping?.tender_parts) return [];

    return mapping.tender_parts
      .filter((part) => !["default", "reject"].includes(part.status))
      .filter((part) => {
        if (confirmedParts.has(part.id)) return false;

        return (
          part.tender_requirements?.some((req) => req.status === "default") ||
          false
        );
      });
  }, [mapping, confirmedParts]);

  const saveCurrentPart = useCallback(async (): Promise<void> => {
    if (!selectedPart) return;

    setIsProcessingConfirmation(true);
    try {
      const requirements = selectedPart.tender_requirements || [];
      const defaultRequirements = requirements.filter(
        (req) => req?.status === "default"
      );

      if (defaultRequirements.length === 0) return;

      await updateRequirementState.mutateAsync({
        id: defaultRequirements.map((req) => req.id),
        status: "approve",
      });

      await updatePartStatus.mutateAsync({
        id: selectedPart.id,
        status: "approve",
      });

      setSessionConfirmedParts((prev) => new Set(prev).add(selectedPart.id));
    } catch (error) {
      console.error("Failed to save part:", error);
      throw error;
    } finally {
      setIsProcessingConfirmation(false);
    }
  }, [selectedPart, updateRequirementState, updatePartStatus]);

  const handleContinue = useCallback(async (): Promise<boolean> => {
    if (isProcessingConfirmation) return false;

    if (partsNeedingConfirmation.length === 0) {
      return true;
    }

    if (selectedPart && !confirmedParts.has(selectedPart.id)) {
      try {
        await saveCurrentPart();
      } catch (error) {
        console.error("Save failed, staying on current part:", error);
        return false;
      }
    }

    const freshConfirmedParts = new Set([
      ...confirmedParts,
      ...(selectedPart ? [selectedPart.id] : []),
    ]);

    const stillNeedingConfirmation =
      mapping?.tender_parts
        ?.filter((part) => !["default", "reject"].includes(part.status))
        ?.filter((part) => {
          if (freshConfirmedParts.has(part.id)) return false;
          return part.tender_requirements?.some(
            (req) => req.status === "default"
          );
        }) || [];

    if (stillNeedingConfirmation.length > 0) {
      setSelectedPart(stillNeedingConfirmation[0]);

      return false;
    }

    return true;
  }, [
    selectedPart,
    confirmedParts,
    partsNeedingConfirmation,
    saveCurrentPart,
    isProcessingConfirmation,
    mapping,
    setSelectedPart,
  ]);

  return {
    confirmedParts,
    isProcessingConfirmation,
    handleContinue,
    partsNeedingConfirmation,
    setSelectedPart,
  };
}
