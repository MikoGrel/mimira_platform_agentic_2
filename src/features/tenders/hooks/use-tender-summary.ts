"use client";

import { useCompletion } from "@ai-sdk/react";
import { useCallback } from "react";
import { Tables } from "$/types/supabase";
import useCurrentLocale from "$/features/i18n/hooks/use-current-locale";

interface UseTenderSummaryProps {
  tender: Tables<"tenders"> | null;
}

export function useTenderSummary({ tender }: UseTenderSummaryProps) {
  const locale = useCurrentLocale();

  const { completion, isLoading, complete, stop } = useCompletion({
    api: "/api/completion",
    id: tender?.id + "-summary",
  });

  const generateSummary = useCallback(() => {
    if (!tender?.description_long_llm) return;

    const prompt = `Analyze this tender and provide a single, comprehensive summary in ${locale} language.
        TENDER: ${tender.description_long_llm}
        REQUIREMENTS STATUS:
        - Met: ${tender.met_requirements ? JSON.stringify(tender.met_requirements) : "None specified"}
        - Need confirmation: ${tender.needs_confirmation_requirements ? JSON.stringify(tender.needs_confirmation_requirements) : "None specified"}
        - Not met: ${tender.not_met_requirements ? JSON.stringify(tender.not_met_requirements) : "None specified"}
        REVIEW CRITERIA: ${tender.review_criteria_llm || "Not specified"}
        Write a natural, conversational summary in 3-4 sentences that explains what this tender is about, assesses your company's fit based on the requirements, highlights any key risks or opportunities, and provides a clear recommendation. Use professional but friendly tone, address the user directly, and avoid bullet points or structured formatting. If locale is not en, Replate tender word with local language equivalents, for example Tender -> Przetarg in Polish.
        Refer to user as "your company" in the summary. Dont give any recommendations, just a summary and if you think the company is a good fit, say so. If you think the company is not a good fit, say so.`;

    complete(prompt);
  }, [
    tender?.description_long_llm,
    tender?.met_requirements,
    tender?.needs_confirmation_requirements,
    tender?.not_met_requirements,
    tender?.review_criteria_llm,
    locale,
    complete,
  ]);

  return {
    completion,
    isLoading,
    generateSummary,
    canGenerate: !!tender?.description_long_llm,
    stop,
  };
}
