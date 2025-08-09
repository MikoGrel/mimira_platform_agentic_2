"use client";

import { Section, SectionTitle, SectionContent } from "./ui-components";
import { RequirementsList } from "./requirements-list";

interface RequirementsSectionProps {
  met_requirements: string[];
  needs_confirmation_requirements: string[];
  not_met_requirements: string[];
}

export function RequirementsSection({
  met_requirements,
  needs_confirmation_requirements,
  not_met_requirements,
}: RequirementsSectionProps) {
  return (
    <Section id="requirements" data-section>
      <SectionTitle>Requirements</SectionTitle>
      <SectionContent>
        <div className="space-y-6">
          <RequirementsList
            title="Met Requirements"
            items={met_requirements}
            type="success"
            collapsed
          />

          <RequirementsList
            title="Needs Confirmation"
            items={needs_confirmation_requirements}
            type="warning"
          />

          <RequirementsList
            title="Not Met Requirements"
            items={not_met_requirements}
            type="error"
          />
        </div>
      </SectionContent>
    </Section>
  );
}
