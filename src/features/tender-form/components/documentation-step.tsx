"use client";

import { Card, CardContent, CardHeader, CardTitle } from "$/components/ui/card";
import {
  InboxTenderMapping,
  InboxTenderPart,
} from "$/features/inbox/api/use-tender-inbox-query";
import React from "react";

interface DocumentationStepProps {
  item: InboxTenderMapping | InboxTenderPart | null | undefined;
  setNextEnabled?: (enabled: boolean) => void;
  onNextHandler?: React.MutableRefObject<(() => Promise<void>) | null>;
}

export function DocumentationStep({
  item,
  setNextEnabled: _setNextEnabled, // eslint-disable-line @typescript-eslint/no-unused-vars
  onNextHandler: _onNextHandler, // eslint-disable-line @typescript-eslint/no-unused-vars
}: DocumentationStepProps) {
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
            ? `Documentation for ${item.part_name || `Part ${item.id}`}`
            : "Required Documentation"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="p-3 border rounded-md">
            <label className="text-sm font-medium">Company Profile</label>
            <input type="file" className="mt-1 w-full" />
          </div>
          <div className="p-3 border rounded-md">
            <label className="text-sm font-medium">Technical Proposal</label>
            <input type="file" className="mt-1 w-full" />
          </div>
          <div className="p-3 border rounded-md">
            <label className="text-sm font-medium">Financial Proposal</label>
            <input type="file" className="mt-1 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
