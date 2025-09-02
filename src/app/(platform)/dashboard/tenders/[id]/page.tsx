"use client";

import { useIndividualTender } from "$/features/tenders";
import { CalendarClock, House, MoveLeft } from "lucide-react";
import Link from "$/components/ui/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef, RefObject } from "react";
import { defineStepper } from "$/components/stepper";
import {
  ConfirmationsStep,
  DataStep,
  DocumentationStep,
  DecisionStep,
  PartsSidebar,
  OverviewStep,
} from "$/features/tender-form/components";
import { hasPartsToAnalyze } from "$/features/tenders/utils/confirmation";
import { getOverviewParts } from "$/features/tenders/utils/parts";
import { Button } from "@heroui/react";
import React from "react";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { InboxTenderPart } from "$/features/inbox/api/use-tender-inbox-query";
import { usePartsManagement } from "$/features/tender-form/hooks";
import { useUpdateTenderStatus } from "$/features/tenders/api/use-update-tender-status";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "$/components/ui/resizable";

const { Stepper, useStepper, utils } = defineStepper(
  {
    id: "overview",
    title: <span>Overview</span>,
  },
  {
    id: "confirmations",
    title: <span>Confirmations</span>,
  },
  {
    id: "data",
    title: <span>Data</span>,
  },
  {
    id: "documentation",
    title: <span>Documentation</span>,
  },
  {
    id: "decision",
    title: <span>Decision</span>,
  }
);

function StepperContent({
  mapping,
  selectedPart,
  setNextEnabled,
  nextHandlerRef,
  confirmedParts,
}: {
  mapping?: InboxTenderMapping | null;
  selectedPart?: InboxTenderPart | null;
  setNextEnabled: (enabled: boolean) => void;
  nextHandlerRef: RefObject<(() => Promise<void>) | null>;
  confirmedParts: Set<string>;
}) {
  const { current, next } = useStepper();

  const renderStepContent = () => {
    switch (current.id) {
      case "overview":
        return (
          <OverviewStep
            mapping={mapping}
            selectedPart={selectedPart}
            setNextEnabled={setNextEnabled}
          />
        );
      case "confirmations":
        return (
          <ConfirmationsStep
            item={selectedPart}
            setNextEnabled={setNextEnabled}
            isConfirmed={
              selectedPart ? confirmedParts.has(selectedPart.id) : false
            }
          />
        );
      case "data":
        return (
          <DataStep
            item={mapping}
            onNext={next}
            setNextEnabled={setNextEnabled}
            onNextHandler={nextHandlerRef}
          />
        );
      case "documentation":
        return <DocumentationStep item={mapping} />;
      case "decision":
        return <DecisionStep item={mapping} />;
      default:
        throw new Error(`Unknown step: ${current}`);
    }
  };

  return (
    <>
      <Stepper.Panel className="h-full w-full">
        <div className="w-full max-w-full">{renderStepContent()}</div>
      </Stepper.Panel>
    </>
  );
}

export default function TenderPage() {
  const params = useParams();
  const { relativeToNow } = useDateFormat();

  const [nextEnabled, setNextEnabled] = useState(true);
  const nextHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const { data: mapping, isLoading } = useIndividualTender({
    mappingId: params.id as string,
    enabled: true,
    skipCache: true,
  });
  const updateTenderStatus = useUpdateTenderStatus();
  const {
    selectedPart,
    confirmedParts,
    isProcessingConfirmation,
    areAllPartsConfirmed,
    areAllPartsExceptCurrentConfirmed,
    handlePartSelect,
    handleConfirmationsBeforeNext,
    confirmationsNextEnabled,
    initialConfirmationsNextEnabled,
  } = usePartsManagement(mapping ?? null);

  const mapStepToStatus = (stepId: string): string | null => {
    switch (stepId) {
      case "overview":
        return "analysis";
      case "confirmations":
        return "questions";
      case "data":
        return "questions";
      case "documentation":
        return "documents_preparing";
      case "decision":
        return "decision_made_applied";
      default:
        return null;
    }
  };

  const mapStatusToStep = (
    status: string | null | undefined
  ): "overview" | "confirmations" | "data" | "documentation" | "decision" => {
    switch (status) {
      case "analysis":
        return "overview";
      case "questions":
        return "confirmations";
      case "questions_in_review_mimira":
        return "data";
      case "documents_preparing":
      case "documents_ready":
      case "documents_reviewed":
        return "documentation";
      case "decision_made_applied":
      case "decision_made_rejected":
      case "rejected":
        return "decision";
      default:
        return "overview";
    }
  };

  const getStepButtonText = (stepId: string) => {
    switch (stepId) {
      case "confirmations":
        if (areAllPartsConfirmed()) {
          return <>Save and continue</>;
        } else if (areAllPartsExceptCurrentConfirmed()) {
          return <>Save and continue</>;
        } else {
          return <>Next part</>;
        }
      case "data":
        return <>Save answers and continue</>;
      case "documentation":
        return <>Upload documents and continue</>;
      case "decision":
        return <>Submit decision</>;
      default:
        return <>Next step</>;
    }
  };

  useEffect(() => {
    if (stepperMethodsRef.current) {
      const currentStepId = stepperMethodsRef.current.current.id;
      if (currentStepId === "confirmations") {
        setNextEnabled(confirmationsNextEnabled);
      } else {
        setNextEnabled(true);
      }
    }
    nextHandlerRef.current = null;
  }, [confirmationsNextEnabled]);

  const stepperMethodsRef = useRef<ReturnType<typeof useStepper> | null>(null);

  const initialStep = useMemo(() => {
    if (isLoading || !mapping) return null;

    const status = mapping.status ?? "analysis";
    if (status === "analysis" || status === "questions") {
      console.log("mapping", mapping);

      const needsAnalysis = hasPartsToAnalyze(mapping);

      console.log("needsAnalysis", needsAnalysis);

      return needsAnalysis ? "confirmations" : "data";
    }

    return mapStatusToStep(status);
  }, [isLoading, mapping]);

  useEffect(() => {
    if (mapping && initialStep === "confirmations") {
      setNextEnabled(initialConfirmationsNextEnabled);
    } else {
      setNextEnabled(true);
    }
  }, [mapping, initialStep, initialConfirmationsNextEnabled]);

  const partSteps = ["overview", "confirmations"];

  if (!initialStep) return null;

  return (
    <main className="w-full h-full bg-primary-gradient">
      <Stepper.Provider initialStep={initialStep} className="h-full">
        {({ methods }) => {
          stepperMethodsRef.current = methods;

          return (
            <div className="grid h-full grid-rows-[auto_1fr]">
              <nav className="w-full p-4 border-b border-sidebar-border bg-background grid grid-rows-1 grid-cols-[450px_1fr]">
                <Link
                  href="/dashboard/tenders/"
                  className="text-sm flex items-center text-muted-foreground gap-2 hover:gap-3 transition-all"
                >
                  <MoveLeft className="stroke-1" /> Return
                </Link>
                <Stepper.Navigation className="px-4">
                  {methods.all.map((step) => (
                    <Stepper.Step
                      key={step.id}
                      of={step.id}
                      className="cursor-default"
                    >
                      <Stepper.Title className="text-sm font-medium">
                        {step.title}
                      </Stepper.Title>
                    </Stepper.Step>
                  ))}
                </Stepper.Navigation>
              </nav>
              <section className="h-full">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                    <PartsSidebar
                      parts={mapping ? getOverviewParts(mapping) : []}
                      selectedPart={selectedPart}
                      onPartSelect={handlePartSelect}
                      fullTenderStep={!partSteps.includes(methods.current.id)}
                    />
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel defaultSize={75}>
                    <div className="flex flex-col h-full">
                      <div className="bg-background border-b border-gray-200 p-4 flex flex-col gap-2 flex-shrink-0">
                        <h1 className="text-sm font-medium">
                          {mapping?.tenders?.order_object}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground ">
                          <span className="flex items-center gap-2">
                            <House className="w-4 h-4" />
                            {mapping?.tenders?.organization_name}
                          </span>
                          <span className="flex items-center gap-2">
                            <CalendarClock className="w-4 h-4" />
                            {mapping?.tenders?.submitting_offers_date &&
                              relativeToNow(
                                new Date(
                                  mapping?.tenders?.submitting_offers_date
                                )
                              )}
                          </span>
                        </div>
                      </div>

                      <div className="flex-[1_0_0] overflow-y-auto bg-background">
                        <div className="p-4 bg-sidebar">
                          <StepperContent
                            mapping={mapping}
                            selectedPart={selectedPart}
                            setNextEnabled={setNextEnabled}
                            nextHandlerRef={nextHandlerRef}
                            confirmedParts={confirmedParts}
                          />
                        </div>
                      </div>

                      <div className="bg-background border-t border-gray-200 p-4 flex-shrink-0">
                        <Stepper.Controls className="flex justify-between">
                          <Button
                            variant="bordered"
                            onPress={() => {
                              methods.beforePrev(() => {
                                const status = mapStepToStatus(
                                  utils.getPrev(methods.current.id).id
                                );
                                if (mapping && status) {
                                  updateTenderStatus.mutate({
                                    mappingId: mapping.id,
                                    status,
                                  });
                                }

                                return true;
                              });
                              methods.prev();
                            }}
                            disabled={methods.isFirst}
                          >
                            Previous step
                          </Button>

                          <div className="flex gap-2">
                            {!methods.isLast && (
                              <Button
                                color="primary"
                                onPress={() => {
                                  methods.beforeNext(async () => {
                                    if (
                                      methods.current.id === "confirmations"
                                    ) {
                                      const ok =
                                        await handleConfirmationsBeforeNext();
                                      if (!ok) return false;
                                    }
                                    if (nextHandlerRef.current) {
                                      await nextHandlerRef.current();
                                    }
                                    return true;
                                  });
                                  methods.beforeNext(() => {
                                    const status = mapStepToStatus(
                                      utils.getNext(methods.current.id).id
                                    );
                                    if (mapping && status) {
                                      updateTenderStatus.mutate({
                                        mappingId: mapping.id,
                                        status,
                                      });
                                    }

                                    return true;
                                  });
                                  methods.next();
                                }}
                                isDisabled={
                                  !nextEnabled || isProcessingConfirmation
                                }
                              >
                                {isProcessingConfirmation
                                  ? "Processing..."
                                  : getStepButtonText(methods.current.id)}
                              </Button>
                            )}
                          </div>
                        </Stepper.Controls>
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </section>
            </div>
          );
        }}
      </Stepper.Provider>
    </main>
  );
}
