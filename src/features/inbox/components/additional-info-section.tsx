"use client";

import {
  Section,
  SectionTitle,
  SectionContent,
  InfoCard,
} from "./ui-components";

interface AdditionalInfoSectionProps {
  application_form_llm: string;
  payment_terms_llm: string;
  contract_penalties_llm: string;
  deposit_llm: string;
  url: string;
}

export function AdditionalInfoSection({
  application_form_llm,
  payment_terms_llm,
  contract_penalties_llm,
  deposit_llm,
  url,
}: AdditionalInfoSectionProps) {
  return (
    <Section id="others" data-section>
      <SectionTitle>Additional Information</SectionTitle>
      <SectionContent>
        <div className="space-y-4">
          {application_form_llm && (
            <InfoCard title="Application Form" content={application_form_llm} />
          )}

          {payment_terms_llm && (
            <InfoCard title="Payment Terms" content={payment_terms_llm} />
          )}

          {contract_penalties_llm && (
            <InfoCard
              title="Contract Penalties"
              content={contract_penalties_llm}
            />
          )}

          {deposit_llm && (
            <InfoCard title="Deposit Information" content={deposit_llm} />
          )}

          {url && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Source URL
              </h4>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
              >
                {url}
              </a>
            </div>
          )}
        </div>
      </SectionContent>
    </Section>
  );
}
