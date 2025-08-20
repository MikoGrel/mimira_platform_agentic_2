"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";

interface DocumentQuestion {
  id: number;
  question: string;
  answer: string | null;
  tender_id: string | null;
}

export function useDocumentQuestions(tenderId?: string) {
  const client = createClient();

  return useQuery({
    queryKey: ["document-questions", tenderId],
    queryFn: async () => {
      if (!tenderId) {
        throw new Error("Tender ID is required");
      }

      const { data, error } = await client
        .from("document_questions")
        .select("*")
        .eq("tender_id", tenderId)
        .order("id", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch document questions: ${error.message}`);
      }

      return data as DocumentQuestion[];
    },
    enabled: !!tenderId,
  });
}
