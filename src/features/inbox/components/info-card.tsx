"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "$/components/ui/accordion";
import { cn } from "$/lib/utils";
import { ReactNode } from "react";

export function InfoCard({
  title,
  content,
  variant = "default",
}: {
  title: string;
  content: ReactNode;
  variant?: "default" | "highlight";
}) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn(
        "px-4 rounded-lg border",
        variant === "highlight"
          ? "bg-primary/5 border-primary/20"
          : "bg-subtle/30 border-border"
      )}
    >
      <AccordionItem value="item-0">
        <AccordionTrigger>
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
