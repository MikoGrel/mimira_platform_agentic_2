"use client";

import { Tables } from "$/types/supabase";
import { Section, SectionTitle, SectionContent } from "./ui-components";
import { ReviewCriteria } from "./review-criteria";

interface ReviewCriteriaSectionProps {
  tender: Tables<"tenders">;
}

export function ReviewCriteriaSection({ tender }: ReviewCriteriaSectionProps) {
  return (
    <Section id="review-criteria" data-section>
      <SectionTitle>Review Criteria</SectionTitle>
      <SectionContent>
        <ReviewCriteria
          reviewCriteria={eval(tender.review_criteria_llm || "[]")}
        />
      </SectionContent>
    </Section>
  );
} 