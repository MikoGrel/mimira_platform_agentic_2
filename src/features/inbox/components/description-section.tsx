"use client";

import React from "react";
import Markdown, { type Components } from "react-markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "$/components/ui/accordion";
import { Section } from "./section";
import { SectionTitle } from "./section-title";
import { SectionContent } from "./section-content";

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

  const markdownComponents: Components = {
    h1: ({ children }) => (
      <h1 className="text-base font-semibold">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-base font-semibold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold">{children}</h3>
    ),

    h4: ({ children }) => <h4 className="text-base font-medium">{children}</h4>,
    p: ({ children }) => (
      <p className="text-sm text-foreground my-2">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1 ml-4">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-sm text-foreground/80 space-y-1 ml-4">
        {children}
      </ol>
    ),
    strong: ({ children }) => (
      <strong className="font-medium text-gray-900">{children}</strong>
    ),
  };

  return (
    <Section id="description" data-section>
      <SectionTitle>Full description</SectionTitle>
      <SectionContent>
        {beforeFirstHeading && (
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed mb-6">
            <Markdown components={markdownComponents}>
              {beforeFirstHeading}
            </Markdown>
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
                  <Markdown components={markdownComponents}>
                    {section.content.join("\n").trim()}
                  </Markdown>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionContent>
    </Section>
  );
}
