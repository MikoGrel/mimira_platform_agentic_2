"use client";

import { memo } from "react";
import { Button, Spinner } from "@heroui/react";
import { Tables } from "$/types/supabase";
import { useTenderSummary } from "../hooks";

interface TenderSummaryProps {
  tender: Tables<"tenders"> | null;
}

export const TenderSummary = memo(function TenderSummary({
  tender,
}: TenderSummaryProps) {
  const { completion, isLoading, generateSummary, canGenerate } =
    useTenderSummary({
      tender,
    });

  if (!canGenerate) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-500">
          No description available for AI summary generation
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">AI Summary</h4>
        <Button
          size="sm"
          onPress={generateSummary}
          isLoading={isLoading}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <span>Generating...</span>}
          {!isLoading && <span>Generate Summary</span>}
        </Button>
      </div>

      {completion ? (
        <p className="text-sm leading-relaxed text-gray-700">{completion}</p>
      ) : isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <span className="text-sm text-gray-600">Generating summary...</span>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          Click &quot;Generate Summary&quot; to create an AI analysis of this
          tender
        </p>
      )}
    </div>
  );
});
