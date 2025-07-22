"use client";

import { Button } from "@heroui/react";
import {
  Calendar,
  House,
  CheckCircle,
  AlertCircle,
  Clock,
  Hash,
  Target,
  Percent,
} from "lucide-react";
import { Tables } from "$/types/supabase";
import { cn } from "$/lib/utils";
import { useEffect, useState } from "react";

interface TenderPreviewProps {
  tender: Tables<"tenders"> | null;
}

interface ReviewCriterion {
  kryterium: string;
  waga: string;
  opis: string;
}

function ReviewCriteriaVisualization({ criteria }: { criteria: string }) {
  let parsedCriteria: ReviewCriterion[] = [];

  try {
    parsedCriteria = JSON.parse(criteria);
  } catch {
    return (
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm whitespace-pre-wrap">{criteria}</p>
      </div>
    );
  }

  if (!Array.isArray(parsedCriteria)) {
    return (
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm whitespace-pre-wrap">{criteria}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Criteria Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {parsedCriteria.map((criterion, index) => {
          const weight = parseInt(criterion.waga.replace("%", ""));
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-sm text-gray-700 capitalize">
                  {criterion.kryterium}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${weight}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  {criterion.waga}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Criteria */}
      <div className="space-y-4">
        {parsedCriteria.map((criterion, index) => {
          const colors = [
            {
              bg: "bg-blue-50",
              border: "border-blue-200",
              accent: "text-blue-700",
            },
            {
              bg: "bg-green-50",
              border: "border-green-200",
              accent: "text-green-700",
            },
            {
              bg: "bg-purple-50",
              border: "border-purple-200",
              accent: "text-purple-700",
            },
          ];
          const color = colors[index % colors.length];

          return (
            <div
              key={index}
              className={`${color.bg} ${color.border} border rounded-lg p-4`}
            >
              <div className="flex items-start justify-between mb-3">
                <h5
                  className={`font-semibold ${color.accent} capitalize flex items-center gap-2`}
                >
                  <span className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  {criterion.kryterium}
                </h5>
                <span className={`${color.accent} font-bold text-lg`}>
                  {criterion.waga}
                </span>
              </div>
              <div className="bg-white bg-opacity-60 rounded-md p-3">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {criterion.opis}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TenderPreview({ tender }: TenderPreviewProps) {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [tender]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!tender) {
    return (
      <section className="sticky top-0 flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p>Select a tender to view details</p>
        </div>
      </section>
    );
  }

  const sections = [
    { id: "at-glance", label: "At a Glance" },
    { id: "description", label: "Description" },
    { id: "requirements", label: "Requirements" },
    { id: "others", label: "Others" },
  ];

  return (
    <section className="h-full w-full">
      <div className="h-full w-full flex flex-col">
        <div className="p-4 border-b border-sidebar-border flex flex-col gap-4 bg-white">
          <h1 className="font-medium w-2/3">{tender.orderobject}</h1>
          <div className="flex gap-2">
            <span className="flex items-center gap-2">
              <House className="w-4 h-4" />
              {tender.organizationname}
            </span>
            <span>&middot;</span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {tender.submittingoffersdate}
            </span>
          </div>
          <div className="flex gap-2">
            <Button color="primary" data-lingo-override-pl="Aplikuj">
              Apply
            </Button>
            <Button variant="flat" color="danger">
              Reject
            </Button>
          </div>
        </div>

        <div className="flex overflow-hidden h-full flex-[1_0_0]">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-8">
              <Section id="at-glance" data-section>
                <SectionHeader>At a Glance</SectionHeader>
                <div className="space-y-4">
                  {tender.description_long_llm && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="text-blue-900">
                        {tender.description_long_llm}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tender.can_participate !== null && (
                      <div className="flex items-center gap-2">
                        {tender.can_participate ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span
                          className={
                            tender.can_participate
                              ? "text-green-700"
                              : "text-red-700"
                          }
                        >
                          {tender.can_participate
                            ? "Eligible to participate"
                            : "Not eligible to participate"}
                        </span>
                      </div>
                    )}

                    {tender.wadium_llm && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            W
                          </span>
                        </div>
                        <span>Wadium: {tender.wadium_llm}</span>
                      </div>
                    )}

                    {tender.ordercompletiondate_llm && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span>
                          Completion: {tender.ordercompletiondate_llm}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Section>

              {/* Description Section */}
              <Section id="description" data-section>
                <SectionHeader>Description</SectionHeader>
                <div className="prose max-w-none">
                  {tender.description_long_llm ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">
                        {tender.description_long_llm}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      No detailed description available
                    </p>
                  )}
                </div>
              </Section>

              {/* Requirements Section */}
              <Section id="requirements" data-section>
                <SectionHeader>Requirements</SectionHeader>
                <div className="space-y-4">
                  {/* Met Requirements */}
                  {tender.met_requirements &&
                    Array.isArray(tender.met_requirements) &&
                    tender.met_requirements.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Met Requirements
                        </h4>
                        <ul className="space-y-2">
                          {tender.met_requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{String(req)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Needs Confirmation Requirements */}
                  {tender.needs_confirmation_requirements &&
                    Array.isArray(tender.needs_confirmation_requirements) &&
                    tender.needs_confirmation_requirements.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Needs Confirmation
                        </h4>
                        <ul className="space-y-2">
                          {tender.needs_confirmation_requirements.map(
                            (req, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{String(req)}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Not Met Requirements */}
                  {tender.not_met_requirements &&
                    Array.isArray(tender.not_met_requirements) &&
                    tender.not_met_requirements.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Not Met Requirements
                        </h4>
                        <ul className="space-y-2">
                          {tender.not_met_requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{String(req)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Review Criteria */}
                  {tender.review_criteria_llm && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-4">
                        Review Criteria
                      </h4>
                      <ReviewCriteriaVisualization
                        criteria={tender.review_criteria_llm}
                      />
                    </div>
                  )}
                </div>
              </Section>

              {/* Others Section */}
              <Section id="others" data-section>
                <SectionHeader>Others</SectionHeader>
                <div className="space-y-4">
                  {tender.application_form_llm && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Application Form
                      </h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          {tender.application_form_llm}
                        </p>
                      </div>
                    </div>
                  )}

                  {tender.payment_terms_llm && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Payment Terms
                      </h4>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          {tender.payment_terms_llm}
                        </p>
                      </div>
                    </div>
                  )}

                  {tender.contract_penalties_llm && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Contract Penalties
                      </h4>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          {tender.contract_penalties_llm}
                        </p>
                      </div>
                    </div>
                  )}

                  {tender.deposit_llm && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Deposit Information
                      </h4>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          {tender.deposit_llm}
                        </p>
                      </div>
                    </div>
                  )}

                  {tender.url && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Source URL
                      </h4>
                      <a
                        href={tender.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                      >
                        {tender.url}
                      </a>
                    </div>
                  )}
                </div>
              </Section>
            </div>
          </div>

          {/* Navigation Sidebar */}
          <div className="w-48 border-l border-sidebar-border bg-gray-50/50 p-4">
            <div className="sticky top-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Outline
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors",
                      activeSection === section.id
                        ? "bg-blue-100 text-blue-700 border-l-2 border-blue-500"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <Hash className="w-3 h-3 opacity-60" />
                    <span className="truncate">{section.label}</span>
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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-semibold font-heading uppercase text-lg text-gray-600 border-b border-gray-200 pb-2 mb-4">
      {children}
    </h2>
  );
}

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
    <div id={id} className={cn("scroll-mt-6", className)} {...props}>
      {children}
    </div>
  );
}
