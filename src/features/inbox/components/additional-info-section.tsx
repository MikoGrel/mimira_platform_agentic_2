"use client";

import { Section } from "./section";
import { InfoCard } from "./info-card";
import { SectionContent } from "./section-content";
import { SectionTitle } from "./section-title";

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
            <InfoCard
              title="Source URL"
              content={
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:text-primary/80 underline break-all"
                >
                  {url}
                </a>
              }
            />
          )}
        </div>
      </SectionContent>
    </Section>
  );
}
