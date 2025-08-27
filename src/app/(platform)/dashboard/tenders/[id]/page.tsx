"use client";

import { useIndividualTender } from "$/features/tenders";
import { CalendarClock, House, MoveLeft } from "lucide-react";
import Link from "$/components/ui/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { defineStepper } from "$/components/stepper";
import {
  ConfirmationsStep,
  DataStep,
  DocumentationStep,
  DecisionStep,
  PartsSidebar,
  OverviewStep,
} from "$/features/tender-form/components";
import { hasRequirementsToConfirmInbox } from "$/features/tenders/utils/confirmation";
import { getOverviewParts } from "$/features/tenders/utils/parts";
import { Button } from "@heroui/react";
import React from "react";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { InboxTenderPart } from "$/features/inbox/api/use-tender-inbox-query";
import {
  useUpdateRequirementState,
  useUpdatePartStatus,
} from "$/features/tender-form/hooks";

const { Stepper, useStepper } = defineStepper(
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
  nextHandlerRef: React.MutableRefObject<(() => Promise<void>) | null>;
  confirmedParts: Set<string>;
}) {
  const { current, next } = useStepper();

  const resolvedItem: InboxTenderMapping | InboxTenderPart | null =
    useMemo(() => {
      if (!mapping) return null;
      if (selectedPart) {
        const foundPart = mapping.tender_parts?.find(
          (part) => part.id === selectedPart.id
        );
        return (foundPart as InboxTenderPart) || null;
      }
      return mapping as InboxTenderMapping;
    }, [selectedPart, mapping]);

  if (!mapping) return null;

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
            item={resolvedItem as InboxTenderPart}
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
        return (
          <DecisionStep
            item={resolvedItem}
            setNextEnabled={setNextEnabled}
            onNextHandler={nextHandlerRef}
          />
        );
      default:
        return (
          <ConfirmationsStep
            item={resolvedItem as InboxTenderPart}
            setNextEnabled={setNextEnabled}
          />
        );
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
  const [selectedPart, setSelectedPart] = useState<InboxTenderPart | null>(
    null
  );
  const { relativeToNow } = useDateFormat();

  const [nextEnabled, setNextEnabled] = useState(true);
  const [isProcessingConfirmation, setIsProcessingConfirmation] =
    useState(false);
  const nextHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const [partsNeedingConfirmation, setPartsNeedingConfirmation] = useState<
    InboxTenderPart[]
  >([]);
  const [confirmedParts, setConfirmedParts] = useState<Set<string>>(new Set());

  const { data: mapping, isLoading } = useIndividualTender({
    mappingId: params.id as string,
    enabled: true,
    skipCache: true,
  });

  const updateRequirementState = useUpdateRequirementState();
  const updatePartStatus = useUpdatePartStatus();

  useEffect(() => {
    if (mapping?.tender_parts) {
      const partsNeedingConfirm = mapping.tender_parts.filter((part) =>
        part.tender_requirements.some((req) => req.status === "default")
      );
      setPartsNeedingConfirmation(partsNeedingConfirm);

      if (partsNeedingConfirm.length > 0) {
        setSelectedPart(partsNeedingConfirm[0]);
      } else if (mapping.tender_parts.length > 0) {
        setSelectedPart(mapping.tender_parts[0]);
      }
    }
  }, [mapping]);

  const handleConfirmCurrentPart = async (): Promise<void> => {
    if (!selectedPart) return;

    setIsProcessingConfirmation(true);

    try {
      const requirements = selectedPart.tender_requirements || [];
      const defaultRequirements = requirements.filter(
        (req) => req.status === "default"
      );

      if (defaultRequirements.length === 0) {
        return;
      }

      const requirementPromises = defaultRequirements.map((req) =>
        updateRequirementState.mutateAsync({
          id: req.id,
          status: "approve",
        })
      );

      const partPromise = updatePartStatus.mutateAsync({
        id: selectedPart.id,
        status: "approve",
      });

      await Promise.all([...requirementPromises, partPromise]);
      setConfirmedParts((prev) => new Set(prev).add(selectedPart.id));
    } catch (error) {
      console.error("Failed to confirm requirements:", error);
      throw error;
    } finally {
      setIsProcessingConfirmation(false);
    }
  };

  const areAllPartsConfirmed = () => {
    return partsNeedingConfirmation.every((part) =>
      confirmedParts.has(part.id)
    );
  };

  const areAllPartsExceptCurrentConfirmed = useCallback(() => {
    if (!selectedPart) return false;
    return partsNeedingConfirmation
      .filter((part) => part.id !== selectedPart.id)
      .every((part) => confirmedParts.has(part.id));
  }, [selectedPart, confirmedParts, partsNeedingConfirmation]);

  const getNextPartToConfirm = () => {
    return partsNeedingConfirmation.find(
      (part) => !confirmedParts.has(part.id)
    );
  };

  const handlePartSelect = (partId: string) => {
    if (!mapping) return;
    const overviewParts = getOverviewParts(mapping);
    const part = overviewParts.find((p) => p.id === partId);
    if (!part) return;
    setSelectedPart(part);
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
        const currentPartNeedsConfirmation =
          selectedPart &&
          partsNeedingConfirmation.some((p) => p.id === selectedPart.id);
        const isCurrentPartConfirmed =
          selectedPart && confirmedParts.has(selectedPart.id);

        setNextEnabled(
          Boolean(
            !currentPartNeedsConfirmation ||
              isCurrentPartConfirmed ||
              areAllPartsExceptCurrentConfirmed()
          )
        );
      } else {
        setNextEnabled(true);
      }
    }
    nextHandlerRef.current = null;
  }, [
    selectedPart,
    confirmedParts,
    partsNeedingConfirmation,
    areAllPartsExceptCurrentConfirmed,
  ]);

  const stepperMethodsRef = useRef<{
    goTo: (
      step: "overview" | "confirmations" | "data" | "documentation" | "decision"
    ) => void;
    current: { id: string };
  } | null>(null);

  useEffect(() => {
    if (mapping && !selectedPart) {
      const overviewParts = getOverviewParts(mapping);
      if (overviewParts && overviewParts.length > 0) {
        const firstPart = overviewParts[0];
        setSelectedPart(firstPart);
      }
    }
  }, [mapping, selectedPart]);

  const initialStep = useMemo(() => {
    if (isLoading || !mapping) return;
    const needsConfirmation = hasRequirementsToConfirmInbox(mapping);

    return needsConfirmation ? "confirmations" : "data";
  }, [isLoading, mapping]);

  useEffect(() => {
    if (mapping && initialStep === "confirmations") {
      const firstPartNeedsConfirmation =
        partsNeedingConfirmation.length > 0 &&
        !confirmedParts.has(partsNeedingConfirmation[0].id);
      setNextEnabled(!firstPartNeedsConfirmation);
    } else {
      setNextEnabled(true);
    }
  }, [mapping, initialStep, partsNeedingConfirmation, confirmedParts]);

  if (isLoading || !mapping) return null;

  const partSteps = ["overview", "confirmations"];

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
                      onClick={() => methods.goTo(step.id)}
                      className="cursor-pointer"
                    >
                      <Stepper.Title className="text-sm font-medium">
                        {step.title}
                      </Stepper.Title>
                    </Stepper.Step>
                  ))}
                </Stepper.Navigation>
              </nav>
              <section className="flex">
                <PartsSidebar
                  parts={mapping ? getOverviewParts(mapping) : []}
                  selectedPart={selectedPart}
                  onPartSelect={handlePartSelect}
                  fullTenderStep={!partSteps.includes(methods.current.id)}
                />

                <div className="flex-1 flex flex-col">
                  <div className="bg-background border-b border-gray-200 p-4 flex flex-col gap-2">
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
                            new Date(mapping?.tenders?.submitting_offers_date)
                          )}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 bg-background p-4 overflow-y-auto min-w-0">
                    <StepperContent
                      mapping={mapping}
                      selectedPart={selectedPart}
                      setNextEnabled={setNextEnabled}
                      nextHandlerRef={nextHandlerRef}
                      confirmedParts={confirmedParts}
                    />
                  </div>

                  <div className="bg-background border-t border-gray-200 p-4">
                    <Stepper.Controls className="flex justify-between">
                      <Button
                        variant="bordered"
                        onClick={() => {
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
                            onPress={async () => {
                              if (methods.current.id === "confirmations") {
                                if (
                                  selectedPart &&
                                  !confirmedParts.has(selectedPart.id)
                                ) {
                                  await handleConfirmCurrentPart();
                                }

                                if (
                                  areAllPartsConfirmed() ||
                                  areAllPartsExceptCurrentConfirmed()
                                ) {
                                  methods.next();
                                } else {
                                  const nextPart = getNextPartToConfirm();
                                  if (nextPart) {
                                    setSelectedPart(nextPart);
                                  }
                                }
                                return;
                              }

                              if (nextHandlerRef.current) {
                                await nextHandlerRef.current();
                                methods.next();
                              } else {
                                methods.next();
                              }
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
                        {methods.isLast && (
                          <Button onPress={methods.reset} variant="bordered">
                            Reset
                          </Button>
                        )}
                      </div>
                    </Stepper.Controls>
                  </div>
                </div>
              </section>
            </div>
          );
        }}
      </Stepper.Provider>
    </main>
  );
}
