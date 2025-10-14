"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "$/components/ui/accordion";
import { Section } from "./section";
import { SectionTitle } from "./section-title";
import { SectionContent } from "./section-content";
import { Markdown } from "$/features/tenders/components/markdown";

interface DescriptionSectionProps {
  description_long_llm: string;
}

export function DescriptionSection({
  description_long_llm,
}: DescriptionSectionProps) {
  const parseIntoSections = (markdownText: string) => {
    const lines = markdownText.split("\n");
    const sections: { title: string; content: string[] }[] = [];
    let currentSection: { title: string; content: string[] } | null = null;
    const beforeFirstHeading: string[] = [];
    let firstHeaderProcessed = false;

    lines.forEach((line: string) => {
      const headingMatch = line.match(/^#+\s+(.+)$/);

      if (headingMatch && !firstHeaderProcessed) {
        firstHeaderProcessed = true;
        const hasContentBefore =
          beforeFirstHeading.join("\n").trim().length > 0;

        if (hasContentBefore) {
          currentSection = {
            title: headingMatch[1],
            content: [],
          };
        } else {
          beforeFirstHeading.push(line);
        }
      } else if (headingMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: headingMatch[1],
          content: [],
        };
      } else {
        if (currentSection) {
          currentSection.content.push(line);
        } else {
          beforeFirstHeading.push(line);
        }
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return {
      beforeFirstHeading: beforeFirstHeading.join("\n").trim(),
      sections,
    };
  };

  const { beforeFirstHeading, sections } =
    parseIntoSections(description_long_llm);

  return (
    <Section id="description" data-section>
      <SectionTitle>Full description</SectionTitle>
      <SectionContent>
        {beforeFirstHeading && (
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed mb-6">
            <Markdown>{beforeFirstHeading}</Markdown>
          </div>
        )}

        <Accordion type="multiple">
          {sections.map((section, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {section.title}
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed pt-2">
                  <Markdown>{section.content.join("\n").trim()}</Markdown>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionContent>
    </Section>
  );
}
