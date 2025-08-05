"use client";

import { Tables } from "$/types/supabase";
import { Section, SectionTitle, SectionContent } from "./ui-components";
import { RequirementsList } from "./requirements-list";

interface RequirementsSectionProps {
  tender: Tables<"tenders">;
}

export function RequirementsSection({ tender }: RequirementsSectionProps) {
  return (
    <Section id="requirements" data-section>
      <SectionTitle>Requirements</SectionTitle>
      <SectionContent>
        <div className="space-y-6">
          <RequirementsList
            title="Met Requirements"
            items={(tender.met_requirements as string[]) || []}
            type="success"
            collapsed
          />

          <RequirementsList
            title="Needs Confirmation"
            items={(tender.needs_confirmation_requirements as string[]) || []}
            type="warning"
          />

          <RequirementsList
            title="Not Met Requirements"
            items={(tender.not_met_requirements as string[]) || []}
            type="error"
          />
        </div>
      </SectionContent>
    </Section>
  );
}
