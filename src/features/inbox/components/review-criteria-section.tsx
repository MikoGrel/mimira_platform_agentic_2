"use client";

import { Section } from "./section";
import { ReviewCriteria } from "./review-criteria";
import { SectionContent } from "./section-content";
import { SectionTitle } from "./section-title";

interface ReviewCriteriaSectionProps {
  review_criteria_llm?: string | null;
}

const canBeEvaluated = (str?: string | null) => {
  if (!str) return false;

  try {
    eval(str);
    return true;
  } catch {
    return false;
  }
};

export function ReviewCriteriaSection({
  review_criteria_llm,
}: ReviewCriteriaSectionProps) {
  const showVisualization = canBeEvaluated(review_criteria_llm);

  return (
    <Section id="review-criteria" data-section>
      <SectionTitle>Review Criteria</SectionTitle>
      <SectionContent>
        {!showVisualization && <p className="text-sm">{review_criteria_llm}</p>}
        {showVisualization && (
          <ReviewCriteria reviewCriteria={eval(review_criteria_llm || "[]")} />
        )}
      </SectionContent>
    </Section>
  );
}
