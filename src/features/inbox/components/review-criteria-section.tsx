"use client";

import { Section, SectionTitle, SectionContent } from "./ui-components";
import { ReviewCriteria } from "./review-criteria";

interface ReviewCriteriaSectionProps {
  review_criteria_llm: string;
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
