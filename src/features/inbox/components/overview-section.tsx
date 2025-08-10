"use client";

import { CheckCircle, AlertCircle, Clock } from "lucide-react";
// import { TenderSummary } from "$/features/tenders";

import { ReactNode } from "react";
import { Section } from "./section";
import { SectionContent } from "./section-content";
import { SectionTitle } from "./section-title";
import { StatusCard } from "./status-card";

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
              type={canParticipate ? "success" : "error"}
            >
              {canParticipate ? (
                <span>Eligible to participate</span>
              ) : (
                <span>Not eligible to participate</span>
              )}
            </StatusCard>
          )}

          {wadium && (
            <StatusCard icon={AlertCircle} title="Wadium" type="warning">
              {wadium}
            </StatusCard>
          )}

          {completionDate && (
            <StatusCard icon={Clock} title="Completion Date" type="neutral">
              {completionDate}
            </StatusCard>
          )}
        </div>
      </SectionContent>
    </Section>
  );
}
