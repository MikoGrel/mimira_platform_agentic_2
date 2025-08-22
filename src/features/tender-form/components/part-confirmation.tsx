"use client";

import { useState } from "react";
import { Button, Chip } from "@heroui/react";
import { useUpdatePartStatus } from "../hooks";
import { IndividualTenderPart } from "$/features/tenders/api/use-individual-tender";

interface PartConfirmationProps {
  part: IndividualTenderPart;
}

export function PartConfirmation({ part }: PartConfirmationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const updatePartStatus = useUpdatePartStatus();

  const handleConfirmPart = async () => {
    try {
      await updatePartStatus.mutateAsync({
        id: part.id,
        status: "confirmed",
      });
    } catch (error) {
      console.error("Failed to confirm part:", error);
    }
  };

  const handleRejectPart = async () => {
    try {
      await updatePartStatus.mutateAsync({
        id: part.id,
        status: "rejected",
      });
    } catch (error) {
      console.error("Failed to reject part:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "warning";
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <div
        className="cursor-pointer p-3 hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-medium">
              {part.part_name || `Part ${part.id}`}
            </span>
            <Chip
              size="sm"
              color={getStatusColor(part.status || "pending")}
              variant="flat"
            >
              {part.status || "pending"}
            </Chip>
          </div>
          <span className="text-lg text-gray-500">
            {isExpanded ? "−" : "+"}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="border-t pt-3">
            <div className="flex gap-2 mt-4 pt-3 border-t">
              <Button
                size="sm"
                onPress={handleConfirmPart}
                isDisabled={
                  updatePartStatus.isPending || part.status === "confirmed"
                }
                color="primary"
                variant="flat"
              >
                {updatePartStatus.isPending ? "Confirming..." : "Confirm Part"}
              </Button>
              <Button
                size="sm"
                variant="flat"
                onPress={handleRejectPart}
                isDisabled={
                  updatePartStatus.isPending || part.status === "rejected"
                }
                color="default"
              >
                {updatePartStatus.isPending ? "Rejecting..." : "Reject Part"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
