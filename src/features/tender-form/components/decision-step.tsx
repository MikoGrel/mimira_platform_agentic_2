"use client";

import { Card, CardContent, CardHeader, CardTitle } from "$/components/ui/card";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { InboxTenderPart } from "$/features/inbox/api/use-tender-inbox-query";
import React from "react";

interface DecisionStepProps {
  item: InboxTenderMapping | InboxTenderPart | null | undefined;
  setNextEnabled?: (enabled: boolean) => void;
  onNextHandler?: React.MutableRefObject<(() => Promise<void>) | null>;
}

export function DecisionStep({
  item,
  setNextEnabled: _setNextEnabled, // eslint-disable-line @typescript-eslint/no-unused-vars
  onNextHandler: _onNextHandler, // eslint-disable-line @typescript-eslint/no-unused-vars
}: DecisionStepProps) {
  if (!item) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">No item selected</p>
      </div>
    );
  }

  // Check if item is a tender part
  function isTenderPart(
    x: InboxTenderMapping | InboxTenderPart | null | undefined
  ): x is InboxTenderPart {
    return x !== null && x !== undefined && "part_id" in x;
  }

  const isPart = isTenderPart(item);
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isPart
            ? `Decision for ${item.part_name || `Part ${item.id}`}`
            : "Final Decision"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground mb-4">
            Review all information before making your final decision.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="decision-submit"
              name="decision"
              value="submit"
            />
            <label htmlFor="decision-submit" className="text-sm">
              Submit tender application
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="decision-draft"
              name="decision"
              value="draft"
            />
            <label htmlFor="decision-draft" className="text-sm">
              Save as draft
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="decision-cancel"
              name="decision"
              value="cancel"
            />
            <label htmlFor="decision-cancel" className="text-sm">
              Cancel application
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
