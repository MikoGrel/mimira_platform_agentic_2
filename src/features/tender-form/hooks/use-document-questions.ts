"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";

interface DocumentQuestion {
  id: string;
  question: string;
  answer: string | null;
  company_mapping_id: string | null;
}

export function useDocumentQuestions(mappingId?: string) {
  const client = createClient();

  return useQuery({
    queryKey: ["document-questions", mappingId],
    queryFn: async () => {
      if (!mappingId) {
        throw new Error("Mapping ID is required");
      }

      const { data, error } = await client
        .from("document_questions")
        .select("*")
        .eq("company_mapping_id", mappingId)
        .order("id", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch document questions: ${error.message}`);
      }

      return data as DocumentQuestion[];
    },
    enabled: !!mappingId,
  });
}
