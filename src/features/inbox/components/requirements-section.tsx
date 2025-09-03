"use client";

import { Section } from "./section";
import { SectionContent } from "./section-content";
import { SectionTitle } from "./section-title";
import { StatusBadge } from "./status-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "$/components/ui/accordion";

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
  const requirementsSections = [
    {
      title: <>Met Requirements</>,
      items: met_requirements,
      type: "success" as const,
      defaultOpen: false,
    },
    {
      title: <>Needs Confirmation</>,
      items: needs_confirmation_requirements,
      type: "warning" as const,
      defaultOpen: true,
    },
    {
      title: <>Not Met Requirements</>,
      items: not_met_requirements,
      type: "error" as const,
      defaultOpen: true,
    },
  ];

  const nonEmptySections = requirementsSections.filter(
    (section) => section.items && section.items.length > 0
  );

  if (nonEmptySections.length === 0) return null;

  const defaultValues = nonEmptySections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => section.defaultOpen)
    .map(({ section, index }) => `item-${index}-${section.items.join("-")}`);

  return (
    <Section id="requirements" data-section>
      <SectionTitle>Requirements</SectionTitle>
      <SectionContent>
        <Accordion
          type="multiple"
          defaultValue={defaultValues}
          key={defaultValues.join("-")}
        >
          {nonEmptySections.map((section, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}-${section.items.join("-")}`}
            >
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  {section.title}
                  <span className="text-muted-foreground">
                    ({section.items.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {section.items.map((item, itemIndex) => (
                  <StatusBadge key={itemIndex} type={section.type}>
                    {String(item)}
                  </StatusBadge>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionContent>
    </Section>
  );
}
