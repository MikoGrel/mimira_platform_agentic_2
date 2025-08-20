"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";

interface SubmitAnswersParams {
  answers: Array<{
    id: number;
    answer: string;
    question: string;
  }>;
}

export function useSubmitDocumentAnswers() {
  const queryClient = useQueryClient();
  const client = createClient();

  return useMutation({
    mutationFn: async ({ answers }: SubmitAnswersParams) => {
      const updates = answers.map(({ id, answer, question }) => ({
        id,
        answer,
        question,
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
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh the data
      if (data && data.length > 0) {
        const tenderId = data[0].tender_id;
        queryClient.invalidateQueries({
          queryKey: ["document-questions", tenderId],
        });
        queryClient.invalidateQueries({ queryKey: ["tender", tenderId] });
      }
    },
  });
}
