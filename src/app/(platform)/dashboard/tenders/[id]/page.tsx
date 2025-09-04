"use client";

import { useIndividualTender } from "$/features/tenders";
import { CalendarClock, House, MoveLeft } from "lucide-react";
import Link from "$/components/ui/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { defineStepper } from "$/components/stepper";
import {
  ConfirmationsStep,
  DocumentationStep,
  DecisionStep,
  PartsSidebar,
  OverviewStep,
} from "$/features/tender-form/components";
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
import { useLastTender } from "$/features/tenders/hooks/use-last-tender";
import { toast } from "sonner";

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
  confirmedParts,
}: {
  mapping?: InboxTenderMapping | null;
  selectedPart?: InboxTenderPart | null;
  setNextEnabled: (enabled: boolean) => void;
  confirmedParts: Set<string>;
}) {
  const { current } = useStepper();

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

  const stepperMethodsRef = useRef<ReturnType<typeof useStepper> | null>(null);
  const [nextEnabled, setNextEnabled] = useState(true);
  const nextHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const { data: mapping, isLoading } = useIndividualTender({
    mappingId: params.id as string,
    skipCache: true,
  });

  const { setLastMappingId } = useLastTender();

  const updateTenderStatus = useUpdateTenderStatus();

  const {
    selectedPart,
    confirmedParts,
    isProcessingConfirmation,
    handlePartSelect,
    handleContinue,
  } = usePartsManagement(mapping ?? null);

  const mapStepToStatus = (stepId: string): string | null => {
    switch (stepId) {
      case "overview":
        return "analysis";
      case "confirmations":
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
  ): "overview" | "confirmations" | "documentation" | "decision" => {
    switch (status) {
      case "analysis":
        return "overview"; // Fix: analysis status should map back to overview
      case "questions":
        return "confirmations";
      case "questions_in_review_mimira":
        return "confirmations";
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

  useEffect(() => {
    if (!mapping?.id) return;

    if (stepperMethodsRef.current) {
      const currentStepId = stepperMethodsRef.current.current.id;
      if (currentStepId === "confirmations") {
        // nextEnabled will be set by ConfirmationsStep via setNextEnabled
        // No need to override it here - let ConfirmationsStep manage it
      } else if (currentStepId === "documentation") {
        setNextEnabled(mapping?.docs_ready ?? false);
      } else {
        setNextEnabled(true);
      }
    }
    nextHandlerRef.current = null;
  }, [mapping?.id, mapping?.docs_ready]);

  const initialStep = useMemo(() => {
    if (isLoading || !mapping) return null;

    const status = mapping.status ?? "analysis";

    return mapStatusToStep(status);
  }, [isLoading, mapping]);

  useEffect(() => {
    if (mapping) {
      setLastMappingId(mapping.id);
    }
  }, [mapping, setLastMappingId]);

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
                  {methods.all.map((step, index) => (
                    <Stepper.Step
                      key={step.id}
                      of={step.id}
                      className="cursor-default"
                      onClick={
                        index < utils.getIndex(methods.current.id)
                          ? () => {
                              methods.goTo(step.id);
                            }
                          : undefined
                      }
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

                      <div className="flex-[1_0_0] overflow-y-auto bg-sidebar">
                        <div className="p-4">
                          <StepperContent
                            mapping={mapping}
                            selectedPart={selectedPart}
                            setNextEnabled={setNextEnabled}
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
                                try {
                                  const prevStepId = utils.getPrev(
                                    methods.current.id
                                  ).id;
                                  const status = mapStepToStatus(prevStepId);
                                  if (mapping && status) {
                                    updateTenderStatus.mutate({
                                      mappingId: mapping.id,
                                      status,
                                    });
                                  }
                                  return true;
                                } catch (error) {
                                  console.error(
                                    "Previous navigation failed:",
                                    error
                                  );
                                  return false;
                                }
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
                                key={nextEnabled.toString()}
                                color="primary"
                                onPress={async () => {
                                  try {
                                    // Handle confirmations step logic first
                                    if (
                                      methods.current.id === "confirmations"
                                    ) {
                                      const shouldProceedToNextStep =
                                        await handleContinue();

                                      if (!shouldProceedToNextStep) {
                                        return; // Don't proceed to next step
                                      }
                                    }

                                    // Execute any pending next handler
                                    if (nextHandlerRef.current) {
                                      await nextHandlerRef.current();
                                    }

                                    // Update tender status only after successful navigation logic
                                    const nextStepId = utils.getNext(
                                      methods.current.id
                                    ).id;
                                    const status = mapStepToStatus(nextStepId);
                                    if (mapping && status) {
                                      updateTenderStatus.mutate({
                                        mappingId: mapping.id,
                                        status,
                                      });
                                    }

                                    // Only call next() if all checks pass
                                    methods.next();
                                  } catch (error) {
                                    if (error instanceof Error)
                                      toast.error(error.message);
                                    console.error("Navigation failed:", error);
                                  }
                                }}
                                isDisabled={
                                  !nextEnabled || isProcessingConfirmation
                                }
                              >
                                Continue
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
