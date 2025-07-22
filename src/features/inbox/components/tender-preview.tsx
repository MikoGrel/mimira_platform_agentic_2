"use client";

import { Button, Spinner } from "@heroui/react";
import {
  Calendar,
  House,
  CheckCircle,
  AlertCircle,
  Clock,
  Hash,
} from "lucide-react";
import { Tables } from "$/types/supabase";
import { cn } from "$/lib/utils";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCompletion } from "@ai-sdk/react";
import useCurrentLocale from "$/features/i18n/hooks/use-current-locale";
import Markdown from "react-markdown";
import { useScrollTrigger } from "$/features/shared/hooks/use-scroll-trigger";

interface TenderPreviewProps {
  tender: Tables<"tenders"> | null;
}

// Reusable Section Components
function Section({
  children,
  className,
  id,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div id={id} className={cn("scroll-mt-6 space-y-4", className)} {...props}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">
      {children}
    </h2>
  );
}

function SectionContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}

// Status Badge Component
function StatusBadge({
  type,
  children,
}: {
  type: "success" | "warning" | "error" | "neutral";
  children: React.ReactNode;
}) {
  const styles = {
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle,
    neutral: Clock,
  };

  const Icon = icons[type];

  return (
    <div className={cn("flex gap-2 px-3 py-2 rounded-lg text-sm")}>
      <Icon className={cn("w-4 h-4 flex-shrink-0", styles[type])} />
      {children}
    </div>
  );
}

// Requirements List Component
function RequirementsList({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "success" | "warning" | "error";
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <div className="space-y-1">
        {items.map((item, index) => (
          <StatusBadge key={index} type={type}>
            {String(item)}
          </StatusBadge>
        ))}
      </div>
    </div>
  );
}

// Info Card Component
function InfoCard({
  title,
  content,
  variant = "default",
}: {
  title: string;
  content: string;
  variant?: "default" | "highlight";
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        variant === "highlight"
          ? "bg-blue-50 border-blue-200"
          : "bg-gray-50 border-gray-200"
      )}
    >
      <h4 className="text-sm font-medium text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    </div>
  );
}

// Status Card Component
function StatusCard({
  icon: Icon,
  title,
  value,
  type = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  type?: "success" | "warning" | "error" | "neutral";
}) {
  const iconColors = {
    success: "text-green-600",
    warning: "text-amber-600",
    error: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <Icon
          className={cn("w-5 h-5 mt-0.5 flex-shrink-0", iconColors[type])}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-sm font-medium text-gray-900 leading-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TenderPreview({ tender }: TenderPreviewProps) {
  const locale = useCurrentLocale();

  const { completion, isLoading, complete } = useCompletion({
    api: "/api/completion",
    id: tender?.id + "-summary",
  });

  const [showSummary, setShowSummary] = useState(false);

  // Auto-generate summary when tender changes
  useEffect(() => {
    if (tender?.description_long_llm) {
      setShowSummary(true);
      if (!completion && !isLoading) {
        complete(
          `Analyze this tender and provide a single, comprehensive summary in ${locale} language.

TENDER: ${tender.description_long_llm}

REQUIREMENTS STATUS:
- Met: ${tender.met_requirements ? JSON.stringify(tender.met_requirements) : "None specified"}
- Need confirmation: ${tender.needs_confirmation_requirements ? JSON.stringify(tender.needs_confirmation_requirements) : "None specified"}  
- Not met: ${tender.not_met_requirements ? JSON.stringify(tender.not_met_requirements) : "None specified"}

REVIEW CRITERIA: ${tender.review_criteria_llm || "Not specified"}

Write a natural, conversational summary in 3-4 sentences that explains what this tender is about, assesses your company's fit based on the requirements, highlights any key risks or opportunities, and provides a clear recommendation. Use professional but friendly tone, address the user directly, and avoid bullet points or structured formatting. If locale is not en, Replate tender word with local language equivalents, for example Tender -> Przetarg in Polish.`
        );
      }
    } else {
      setShowSummary(false);
    }
  }, [
    tender?.id,
    tender?.description_long_llm,
    locale,
    completion,
    isLoading,
    complete,
    tender?.met_requirements,
    tender?.needs_confirmation_requirements,
    tender?.not_met_requirements,
    tender?.review_criteria_llm,
  ]);

  const [activeSection, setActiveSection] = useState<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const isHeaderCollapsed = useScrollTrigger({
    threshold: 100,
    containerRef: scrollRef,
  });

  useEffect(() => {
    if (!scrollRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: scrollRef.current,
        rootMargin: "-10% 0px -60% 0px",
        threshold: 0.1,
      }
    );

    // Wait a bit for sections to be rendered
    const timeoutId = setTimeout(() => {
      const sections = document.querySelectorAll("[data-section]");
      sections.forEach((section) => observer.observe(section));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [tender]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    const container = scrollRef.current;

    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = container.scrollTop;

      const targetScrollTop =
        scrollTop + elementRect.top - containerRect.top - 24;

      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  };

  if (!tender) {
    return (
      <section className="sticky top-0 flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-sm">Select a tender to view details</p>
        </div>
      </section>
    );
  }

  const sections = [
    { id: "at-glance", label: <span>Overview</span> },
    { id: "requirements", label: <span>Requirements</span> },
    { id: "description", label: <span>Description</span> },
    { id: "others", label: <span>Additional Info</span> },
  ];

  return (
    <section className="h-full w-full">
      <div className="h-full w-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white overflow-hidden px-6 py-4">
          <motion.h1
            className="font-semibold text-gray-900 w-2/3"
            animate={{
              fontSize: isHeaderCollapsed ? "14px" : "18px",
              lineHeight: isHeaderCollapsed ? "20px" : "28px",
              marginBottom: isHeaderCollapsed ? "4px" : "0px",
            }}
            transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
          >
            {tender.orderobject}
          </motion.h1>

          <AnimatePresence>
            {!isHeaderCollapsed && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
              >
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <House className="w-4 h-4" />
                    {tender.organizationname}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {tender.submittingoffersdate}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button color="primary" data-lingo-override-pl="Aplikuj">
                    Apply
                  </Button>
                  <Button variant="flat" color="danger">
                    Reject
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isHeaderCollapsed && (
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
            >
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <House className="w-3 h-3" />
                  {tender.organizationname}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {tender.submittingoffersdate}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="primary"
                  data-lingo-override-pl="Aplikuj"
                >
                  Apply
                </Button>
                <Button size="sm" variant="flat" color="danger">
                  Reject
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex overflow-hidden h-full flex-[1_0_0]">
          <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="px-6 py-6 space-y-8">
              {/* Overview Section */}
              <Section id="at-glance" data-section>
                <SectionTitle>Overview</SectionTitle>
                <SectionContent>
                  {/* AI Summary */}
                  {tender?.description_long_llm ? (
                    showSummary && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        {completion ? (
                          <p className="text-sm leading-relaxed text-gray-700">
                            {completion}
                          </p>
                        ) : isLoading ? (
                          <div className="flex items-center gap-2">
                            <Spinner size="sm" />
                            <span className="text-sm text-gray-600">
                              Generating summary...
                            </span>
                          </div>
                        ) : null}
                      </div>
                    )
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">
                        No description available for AI summary generation
                      </p>
                    </div>
                  )}

                  {/* Key Information Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tender.can_participate !== null && (
                      <StatusCard
                        icon={
                          tender.can_participate ? CheckCircle : AlertCircle
                        }
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

              {/* Requirements Section */}
              <Section id="requirements" data-section>
                <SectionTitle>Requirements</SectionTitle>
                <SectionContent>
                  <div className="space-y-6">
                    <RequirementsList
                      title="Met Requirements"
                      items={(tender.met_requirements as string[]) || []}
                      type="success"
                    />

                    <RequirementsList
                      title="Needs Confirmation"
                      items={
                        (tender.needs_confirmation_requirements as string[]) ||
                        []
                      }
                      type="warning"
                    />

                    <RequirementsList
                      title="Not Met Requirements"
                      items={(tender.not_met_requirements as string[]) || []}
                      type="error"
                    />

                    {tender.review_criteria_llm && (
                      <InfoCard
                        title="Review Criteria"
                        content={tender.review_criteria_llm}
                        variant="highlight"
                      />
                    )}
                  </div>
                </SectionContent>
              </Section>

              {/* Description Section */}
              <Section id="description" data-section>
                <SectionTitle>Description</SectionTitle>
                <SectionContent>
                  {tender.description_long_llm ? (
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <Markdown>{tender.description_long_llm}</Markdown>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No detailed description available
                    </p>
                  )}
                </SectionContent>
              </Section>

              {/* Additional Information Section */}
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
            </div>
          </div>

          {/* Navigation Sidebar */}
          <div className="border-l border-gray-200 bg-gray-50/50 overflow-hidden w-48 p-4">
            <div className="sticky top-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Contents
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100",
                      {
                        "bg-gray-100 text-gray-900":
                          activeSection === section.id,
                        "text-gray-600": activeSection !== section.id,
                      }
                    )}
                  >
                    <Hash className="w-3 h-3 opacity-60" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
