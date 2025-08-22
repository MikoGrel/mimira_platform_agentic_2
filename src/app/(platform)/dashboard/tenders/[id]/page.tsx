"use client";

import { useIndividualTender } from "$/features/tenders";
import { CalendarClock, House, MoveLeft } from "lucide-react";
import Link from "$/components/ui/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { defineStepper } from "$/components/stepper";
import { IndividualTenderPart } from "$/features/tenders/api/use-individual-tender";
import {
  ConfirmationsStep,
  DataStep,
  DocumentationStep,
  DecisionStep,
  PartsSidebar,
} from "$/features/tender-form/components";
import { hasProductsToConfirm } from "$/features/tenders/utils/confirmation";
import { getPendingParts } from "$/features/tenders/utils/parts";
import { Button } from "@heroui/react";
import React from "react";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { InboxTenderPart } from "$/features/inbox/api/use-tender-inbox-query";

const { Stepper, useStepper } = defineStepper(
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
}: {
  mapping?: InboxTenderMapping | null;
  selectedPart?: InboxTenderPart | null;
  setNextEnabled: (enabled: boolean) => void;
  nextHandlerRef: React.MutableRefObject<(() => Promise<void>) | null>;
}) {
  const { current, next } = useStepper();

  const resolvedItem = useMemo(() => {
    if (!mapping) return null;
    if (!selectedPart) return mapping;
    return mapping?.tender_parts?.find((part) => part.id === selectedPart.id);
  }, [selectedPart, mapping]);

  if (!mapping) return null;

  const renderStepContent = () => {
    switch (current.id) {
      case "confirmations":
        return (
          <ConfirmationsStep
            item={resolvedItem}
            setNextEnabled={setNextEnabled}
            onNextHandler={nextHandlerRef}
          />
        );
      case "data":
        return (
          <DataStep
            item={resolvedItem}
            onNext={next}
            setNextEnabled={setNextEnabled}
            onNextHandler={nextHandlerRef}
          />
        );
      case "documentation":
        return (
          <DocumentationStep
            item={resolvedItem}
            setNextEnabled={setNextEnabled}
            onNextHandler={nextHandlerRef}
          />
        );
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
            item={resolvedItem}
            setNextEnabled={setNextEnabled}
            onNextHandler={nextHandlerRef}
          />
        );
    }
  };

  return (
    <>
      <Stepper.Panel>{renderStepContent()}</Stepper.Panel>
    </>
  );
}

export default function TenderPage() {
  const params = useParams();
  const [selectedPart, setSelectedPart] = useState<IndividualTenderPart | null>(
    null
  );
  const { relativeToNow } = useDateFormat();

  const [nextEnabled, setNextEnabled] = useState(true);
  const nextHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const { data: mapping } = useIndividualTender({
    mappingId: params.id as string,
    enabled: true,
  });

  const handlePartSelect = (
    partId: string,
    stepperMethods?: {
      goTo: (
        step: "confirmations" | "data" | "documentation" | "decision"
      ) => void;
    }
  ) => {
    if (!mapping) return;
    const pendingParts = getPendingParts(mapping);
    if (!pendingParts) return;

    const part = pendingParts.find((p) => p.id === partId);
    setSelectedPart(part || null);

    if (!part) return;

    if (stepperMethods) {
      const newInitialStep = hasProductsToConfirm(part)
        ? "confirmations"
        : "data";
      stepperMethods.goTo(newInitialStep);
    }
  };

  // Helper function to get step-specific button text
  const getStepButtonText = (stepId: string) => {
    switch (stepId) {
      case "confirmations":
        return <>Confirm and continue</>;
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
    setNextEnabled(true);
    nextHandlerRef.current = null;
  }, [selectedPart]);

  const stepperMethodsRef = useRef<{
    goTo: (
      step: "confirmations" | "data" | "documentation" | "decision"
    ) => void;
  } | null>(null);

  useEffect(() => {
    if (mapping && !selectedPart) {
      const pendingParts = getPendingParts(mapping);
      if (pendingParts && pendingParts.length > 0) {
        const firstPart = pendingParts[0];
        setSelectedPart(firstPart);

        if (stepperMethodsRef.current) {
          const newInitialStep = hasProductsToConfirm(firstPart)
            ? "confirmations"
            : "data";
          stepperMethodsRef.current.goTo(newInitialStep);
        }
      }
    }
  }, [mapping, selectedPart]);

  useEffect(() => {
    if (selectedPart && stepperMethodsRef.current) {
      const newStep = hasProductsToConfirm(selectedPart)
        ? "confirmations"
        : "data";
      stepperMethodsRef.current.goTo(newStep);
    }
  }, [selectedPart]);

  const initialStep = useMemo(() => {
    if (!selectedPart) return "data";
    return hasProductsToConfirm(selectedPart) ? "confirmations" : "data";
  }, [selectedPart]);

  return (
    <main className="w-full h-full bg-primary-gradient">
      <Stepper.Provider initialStep={initialStep} className="h-full">
        {({ methods }) => {
          // Store methods in ref for use in useEffect
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
                  parts={
                    mapping?.tender_parts.filter(
                      (p) => p.status !== "default"
                    ) || []
                  }
                  selectedPart={selectedPart}
                  onPartSelect={(partId) => handlePartSelect(partId, methods)}
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

                  <div className="flex-1 bg-background p-4 overflow-y-auto">
                    <StepperContent
                      mapping={mapping}
                      selectedPart={selectedPart}
                      setNextEnabled={setNextEnabled}
                      nextHandlerRef={nextHandlerRef}
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
                              if (nextHandlerRef.current) {
                                await nextHandlerRef.current();
                                methods.next();
                              }

                              methods.next();
                            }}
                            disabled={!nextEnabled}
                          >
                            {getStepButtonText(methods.current.id)}
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
