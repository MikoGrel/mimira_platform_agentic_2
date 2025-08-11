"use client";

import { Section } from "./section";
import Markdown from "react-markdown";
import { SectionContent } from "./section-content";
import { SectionTitle } from "./section-title";

interface DescriptionSectionProps {
  description_long_llm: string;
}

export function DescriptionSection({
  description_long_llm,
}: DescriptionSectionProps) {
  return (
    <Section id="description" data-section>
      <SectionTitle>Description</SectionTitle>
      <SectionContent>
        {description_long_llm ? (
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed -pt-2">
            <Markdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-semibold">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-medium">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="text-sm text-foreground my-2">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-sm text-foreground/80 space-y-1">
                    {children}
                  </ol>
                ),
              }}
            >
              {description_long_llm}
            </Markdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No detailed description available
          </p>
        )}
      </SectionContent>
    </Section>
  );
}
