"use client";

import { Section } from "./section";
import { ReviewCriteria } from "./review-criteria";
import { SectionContent } from "./section-content";
import { SectionTitle } from "./section-title";

interface ReviewCriteriaSectionProps {
  review_criteria_llm?: string | null;
}

export function ReviewCriteriaSection({
  review_criteria_llm,
}: ReviewCriteriaSectionProps) {
  return (
    <Section id="review-criteria" data-section>
      <SectionTitle>Review Criteria</SectionTitle>
      <SectionContent>
        <ReviewCriteria reviewCriteria={eval(review_criteria_llm || "[]")} />
      </SectionContent>
    </Section>
  );
}
