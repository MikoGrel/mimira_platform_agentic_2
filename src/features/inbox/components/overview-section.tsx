"use client";

import { CheckCircle, AlertCircle, House } from "lucide-react";

import { ReactNode } from "react";
import { Section } from "./section";
import { SectionContent } from "./section-content";
import { SectionTitle } from "./section-title";
import { StatusCard } from "./status-card";
import { startCase } from "lodash-es";

interface OverviewSectionProps {
  title?: ReactNode;
  canParticipate: boolean;
  wadium: string;
  completionDate: string;
  voievodeship: string;
}

export function OverviewSection({
  title,
  canParticipate,
  wadium,
  voievodeship,
}: OverviewSectionProps) {
  return (
    <Section id="at-glance" data-section>
      <SectionTitle>{title || <>Overview</>}</SectionTitle>
      <SectionContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {canParticipate !== null && (
            <StatusCard
              icon={canParticipate ? CheckCircle : AlertCircle}
              title="Possibility to participate "
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
            <StatusCard icon={AlertCircle} title="Wadium" type="info">
              {wadium}
            </StatusCard>
          )}

          {voievodeship && (
            <StatusCard icon={House} title="Voievodeship" type="neutral">
              {startCase(voievodeship)}
            </StatusCard>
          )}
        </div>
      </SectionContent>
    </Section>
  );
}
