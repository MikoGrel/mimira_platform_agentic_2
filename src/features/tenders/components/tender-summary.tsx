"use client";

import { memo } from "react";
import { Spinner } from "@heroui/react";
import { Tables } from "$/types/supabase";
import { useTenderSummary } from "../hooks";

interface TenderSummaryProps {
  tender: Tables<"tenders"> | null;
}

export const TenderSummary = memo(function TenderSummary({
  tender,
}: TenderSummaryProps) {
  const { completion, isLoading, showSummary } = useTenderSummary({ tender });

  if (!tender?.description_long_llm) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-500">
          No description available for AI summary generation
        </p>
      </div>
    );
  }

  if (!showSummary) {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      {completion ? (
        <p className="text-sm leading-relaxed text-gray-700">{completion}</p>
      ) : isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <span className="text-sm text-gray-600">Generating summary...</span>
        </div>
      ) : null}
    </div>
  );
});
