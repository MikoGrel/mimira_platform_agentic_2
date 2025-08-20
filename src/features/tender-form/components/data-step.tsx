"use client";

import { useState, useEffect, useCallback } from "react";
import React from "react";
import {
  IndividualTender,
  IndividualTenderPart,
} from "$/features/tenders/api/use-individual-tender";
import {
  useDocumentQuestions,
  useSubmitDocumentAnswers,
} from "$/features/tender-form/hooks";
import { toast } from "sonner";
import { Alert } from "@heroui/react";

interface DataStepProps {
  item: IndividualTender | IndividualTenderPart | null | undefined;
  onNext?: () => void;
  setNextEnabled?: (enabled: boolean) => void;
  onNextHandler?: React.MutableRefObject<(() => Promise<void>) | null>;
}

export function DataStep({
  item,
  onNext,
  setNextEnabled,
  onNextHandler,
}: DataStepProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  function isTenderPart(
    x: IndividualTender | IndividualTenderPart | null | undefined
  ): x is IndividualTenderPart {
    return x !== null && x !== undefined && "part_uuid" in x;
  }

  const isPart = isTenderPart(item);

  const tenderId = item
    ? isPart
      ? item.tender_id || undefined
      : item.id || undefined
    : undefined;

  const { data: questions, isLoading, error } = useDocumentQuestions(tenderId);

  const submitAnswers = useSubmitDocumentAnswers();

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (!questions) return;

    try {
      const answersToSubmit = questions.map((question) => ({
        id: question.id,
        answer: answers[question.id] || question.answer || "",
        question: question.question,
      }));

      await submitAnswers.mutateAsync({ answers: answersToSubmit });

      toast.success("Document answers saved successfully!");

      // Redirect to next step or call onNext if provided
      if (onNext) {
        onNext();
      }
    } catch (error) {
      toast.error("Failed to save answers. Please try again.");
      console.error("Error submitting answers:", error);
    }
  }, [questions, answers, submitAnswers, onNext]);

  useEffect(() => {
    if (questions) {
      const initialAnswers: Record<number, string> = {};
      questions.forEach((question) => {
        if (question.answer) {
          initialAnswers[question.id] = question.answer;
        }
      });
      setAnswers(initialAnswers);
    }
  }, [questions]);

  useEffect(() => {
    if (questions && setNextEnabled) {
      const allAnswered = questions.every((question) => {
        const answer = answers[question.id] || question.answer || "";
        return answer.trim().length > 0;
      });
      setNextEnabled(allAnswered);
    }
  }, [answers, questions, setNextEnabled]);

  useEffect(() => {
    if (onNextHandler) {
      onNextHandler.current = handleSubmit;
    }
  }, [onNextHandler, handleSubmit]);

  if (isLoading) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-500">
        <p className="text-sm">Failed to load questions. Please try again.</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">No questions available for this tender.</p>
      </div>
    );
  }

  return (
    <form className="space-y-4">
      <Alert color="primary">
        Fill in the answers to the questions below to proceed to the next step.
      </Alert>

      {questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {question.question}
          </label>
          <textarea
            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer..."
          />
        </div>
      ))}
    </form>
  );
}
