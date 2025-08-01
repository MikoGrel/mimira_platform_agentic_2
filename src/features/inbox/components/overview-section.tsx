"use client";

import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Tables } from "$/types/supabase";
import { TenderSummary } from "$/features/tenders";
import { Section, SectionTitle, SectionContent, StatusCard } from "./ui-components";

interface OverviewSectionProps {
  tender: Tables<"tenders">;
}

export function OverviewSection({ tender }: OverviewSectionProps) {
  return (
    <Section id="at-glance" data-section>
      <SectionTitle>Overview</SectionTitle>
      <SectionContent>
        {/* AI Summary */}
        <TenderSummary tender={tender} />

        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tender.can_participate !== null && (
            <StatusCard
              icon={tender.can_participate ? CheckCircle : AlertCircle}
              title="Eligibility"
              value={
                tender.can_participate
                  ? "Eligible to participate"
                  : "Not eligible to participate"
              }
              type={tender.can_participate ? "success" : "error"}
            />
          )}

          {tender.wadium_llm && (
            <StatusCard
              icon={AlertCircle}
              title="Wadium"
              value={tender.wadium_llm}
              type="warning"
            />
          )}

          {tender.ordercompletiondate_llm && (
            <StatusCard
              icon={Clock}
              title="Completion Date"
              value={tender.ordercompletiondate_llm}
              type="neutral"
            />
          )}
        </div>
      </SectionContent>
    </Section>
  );
} 