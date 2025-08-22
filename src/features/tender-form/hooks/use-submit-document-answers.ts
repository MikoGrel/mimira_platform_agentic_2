"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";

interface SubmitAnswersParams {
  mappingId: string;
  answers: Array<{
    id: string;
    answer: string;
    question: string;
  }>;
}

export function useSubmitDocumentAnswers() {
  const queryClient = useQueryClient();
  const client = createClient();

  return useMutation({
    mutationFn: async ({ mappingId, answers }: SubmitAnswersParams) => {
      const updates = answers.map(({ id, answer, question }) => ({
        id,
        answer,
        question,
        company_mapping_id: mappingId,
      }));

      const { data, error } = await client
        .from("document_questions")
        .upsert(updates, { onConflict: "id" })
        .select();

      if (error) {
        throw new Error(`Failed to submit answers: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, { mappingId }) => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["document-questions", mappingId],
      });
      queryClient.invalidateQueries({ queryKey: ["tender", mappingId] });
    },
  });
}
