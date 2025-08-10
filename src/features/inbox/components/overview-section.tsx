"use client";

import { CheckCircle, AlertCircle, Clock } from "lucide-react";
// import { TenderSummary } from "$/features/tenders";
import {
  Section,
  SectionTitle,
  SectionContent,
  StatusCard,
} from "./ui-components";
import { ReactNode } from "react";

interface OverviewSectionProps {
  title?: ReactNode;
  canParticipate: boolean;
  wadium: string;
  completionDate: string;
}

export function OverviewSection({
  title,
  canParticipate,
  wadium,
  completionDate,
}: OverviewSectionProps) {
  return (
    <Section id="at-glance" data-section>
      <SectionTitle>{title || <>Overview</>}</SectionTitle>
      <SectionContent>
        {/* <TenderSummary tender={tender} /> */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {canParticipate !== null && (
            <StatusCard
              icon={canParticipate ? CheckCircle : AlertCircle}
              title="Eligibility"
              value={
                canParticipate
                  ? "Eligible to participate"
                  : "Not eligible to participate"
              }
              type={canParticipate ? "success" : "error"}
            />
          )}

          {wadium && (
            <StatusCard
              icon={AlertCircle}
              title="Wadium"
              value={wadium}
              type="warning"
            />
          )}

          {completionDate && (
            <StatusCard
              icon={Clock}
              title="Completion Date"
              value={completionDate}
              type="neutral"
            />
          )}
        </div>
      </SectionContent>
    </Section>
  );
}
