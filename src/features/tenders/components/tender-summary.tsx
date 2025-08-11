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
      <div className="p-4 bg-subtle border border-border rounded-lg">
        <p className="text-sm text-muted-foreground">
          No description available for AI summary generation
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">AI Summary</h4>
        <Button
          size="sm"
          onPress={generateSummary}
          isLoading={isLoading}
          className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <span>Generating...</span>}
          {!isLoading && <span>Generate Summary</span>}
        </Button>
      </div>

      {completion ? (
        <p className="text-sm leading-relaxed text-foreground/70">
          {completion}
        </p>
      ) : isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <span className="text-sm text-muted-foreground">
            Generating summary...
          </span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Click &quot;Generate Summary&quot; to create an AI analysis of this
          tender
        </p>
      )}
    </div>
  );
});
