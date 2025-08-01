"use client";

import { Tables } from "$/types/supabase";
import { Section, SectionTitle, SectionContent, InfoCard } from "./ui-components";

interface AdditionalInfoSectionProps {
  tender: Tables<"tenders">;
}

export function AdditionalInfoSection({ tender }: AdditionalInfoSectionProps) {
  return (
    <Section id="others" data-section>
      <SectionTitle>Additional Information</SectionTitle>
      <SectionContent>
        <div className="space-y-4">
          {tender.application_form_llm && (
            <InfoCard
              title="Application Form"
              content={tender.application_form_llm}
            />
          )}

          {tender.payment_terms_llm && (
            <InfoCard
              title="Payment Terms"
              content={tender.payment_terms_llm}
            />
          )}

          {tender.contract_penalties_llm && (
            <InfoCard
              title="Contract Penalties"
              content={tender.contract_penalties_llm}
            />
          )}

          {tender.deposit_llm && (
            <InfoCard
              title="Deposit Information"
              content={tender.deposit_llm}
            />
          )}

          {tender.url && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Source URL
              </h4>
              <a
                href={tender.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
              >
                {tender.url}
              </a>
            </div>
          )}
        </div>
      </SectionContent>
    </Section>
  );
} 