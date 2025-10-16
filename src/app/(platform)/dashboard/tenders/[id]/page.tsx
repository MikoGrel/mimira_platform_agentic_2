"use client";

import {
  ChatbotDrawer,
  CommentsDrawer,
  useIndividualTender,
} from "$/features/tenders";
import {
  CalendarClock,
  House,
  MessageSquareText,
  MoveLeft,
  Bot,
} from "lucide-react";
import Link from "$/components/ui/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { defineStepper } from "$/components/stepper";
import {
  DocumentsDecisionStep,
  PartsSidebar,
  OverviewStep,
} from "$/features/tender-form/components";
import { getOverviewParts } from "$/features/tenders/utils/parts";
import { Button } from "@heroui/react";
import React from "react";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { InboxTenderPart } from "$/features/inbox/api/use-tender-inbox-query";
import { useUpdateTenderStatus } from "$/features/tenders/api/use-update-tender-status";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "$/components/ui/resizable";
import { useLastTender } from "$/features/tenders/hooks/use-last-tender";
import { toast } from "sonner";
import {
  MappingStatus,
  MappingStatusType,
} from "$/features/tenders/constants/status";

const { Stepper, useStepper } = defineStepper(
  {
    id: "overview",
    title: <span>Overview</span>,
  },
  {
    id: "documents-preparing",
    title: <span>Preparing documents</span>,
  },
  {
    id: "documents-ready",
    title: <span>Documents ready</span>,
  }
);

function StepperContent({
  mapping,
  selectedPart,
}: {
  mapping?: InboxTenderMapping | null;
  selectedPart?: InboxTenderPart | null;
}) {
  const { current } = useStepper();
  const { relativeToNow } = useDateFormat();
  const [nextEnabled, setNextEnabled] = useState(true);
  const nextHandlerRef = useRef<(() => Promise<void>) | null>(null);
  const [commentsOpened, setCommentsOpened] = useState(false);
  const [chatOpened, setChatOpened] = useState(false);
  const updateTenderStatus = useUpdateTenderStatus();

  const methods = useStepper();

  const mapStepToStatus = useCallback(
    (stepId: string): MappingStatusType | null => {
      switch (stepId) {
        case "overview":
          return MappingStatus.analysis;
        case "documents-preparing":
          return MappingStatus.documents_preparing;
        case "documents-ready":
          return MappingStatus.documents_ready;
        default:
          return null;
      }
    },
    []
  );

  useEffect(() => {
    if (!mapping?.id || !current) return;

    if (current.id === "documents-preparing") {
      // On preparing step, can proceed when docs_ready becomes true
      setNextEnabled(mapping?.docs_ready ?? false);
    } else if (current.id === "documents-ready") {
      // On ready step, always enabled
      setNextEnabled(true);
    } else {
      setNextEnabled(true);
    }
  }, [mapping?.id, mapping?.docs_ready, current]);

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
      case "documents-preparing":
      case "documents-ready":
        return <DocumentsDecisionStep item={mapping} />;
      default:
        throw new Error(`Unknown step: ${current}`);
    }
  };

  return (
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
          {mapping?.tenders?.submitting_offers_date && (
            <span
              className={`flex items-center gap-2 ${mapping?.tenders?.has_offersdate_changed ? "text-warning-600" : ""}`}
            >
              <CalendarClock className="w-4 h-4" />
              <span>
                {mapping?.tenders?.has_offersdate_changed && (
                  <span>New term:&nbsp;</span>
                )}
                {relativeToNow(
                  new Date(mapping?.tenders?.submitting_offers_date)
                )}
              </span>
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="sm"
              variant="ghost"
              onPress={() => setChatOpened(true)}
              className="!min-w-6"
              data-lingo-skip
            >
              <Bot className="w-4 h-4 stroke-[1.5]" /> Asystent
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => setCommentsOpened(true)}
              className="!min-w-6"
            >
              <MessageSquareText className="w-4 h-4 stroke-[1.5]" /> Comments
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-[1_0_0] overflow-y-auto bg-sidebar">
        <div className="p-4">
          <Stepper.Panel className="h-full w-full">
            <div className="w-full max-w-full">{renderStepContent()}</div>
          </Stepper.Panel>
        </div>
      </div>

      <div className="bg-background border-t border-gray-200 p-4 flex-shrink-0">
        <Stepper.Controls className="flex justify-between">
          <Button
            variant="bordered"
            onPress={() => {
              methods.beforePrev(() => {
                try {
                  const currentIndex = methods.all.findIndex(
                    (s) => s.id === methods.current.id
                  );
                  if (currentIndex > 0) {
                    const prevStepId = methods.all[currentIndex - 1].id;
                    const status = mapStepToStatus(prevStepId);
                    if (mapping && status) {
                      updateTenderStatus.mutate({
                        mappingId: mapping.id,
                        status,
                      });
                    }
                  }
                  return true;
                } catch (error) {
                  console.error("Previous navigation failed:", error);
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
                onPress={() => {
                  if (!nextEnabled) {
                    return;
                  }

                  const runNextTransition = async () => {
                    try {
                      // Execute any pending next handler
                      if (nextHandlerRef.current) {
                        await nextHandlerRef.current();
                      }

                      // Update tender status only after successful navigation logic
                      const currentIndex = methods.all.findIndex(
                        (s) => s.id === methods.current.id
                      );
                      if (currentIndex < methods.all.length - 1) {
                        const nextStepId = methods.all[currentIndex + 1].id;
                        const status = mapStepToStatus(nextStepId);
                        if (mapping && status) {
                          updateTenderStatus.mutate({
                            mappingId: mapping.id,
                            status,
                          });
                        }
                      }

                      // Only call next() if all checks pass
                      methods.next();
                    } catch (error) {
                      if (error instanceof Error) toast.error(error.message);
                      console.error("Navigation failed:", error);
                    }
                  };

                  void runNextTransition();
                }}
                isDisabled={!nextEnabled}
              >
                Next step
              </Button>
            )}
          </div>
        </Stepper.Controls>
      </div>

      <CommentsDrawer
        mapping={mapping}
        open={commentsOpened}
        setOpen={setCommentsOpened}
      />
      <ChatbotDrawer
        key={mapping?.id ?? "tender-chatbot"}
        open={chatOpened}
        setOpen={setChatOpened}
        mappingId={mapping?.id ?? null}
        tenderTitle={mapping?.tenders?.order_object ?? null}
      />
    </div>
  );
}

export default function TenderPage() {
  const params = useParams();

  const { data: mapping, isLoading } = useIndividualTender({
    mappingId: params.id as string,
    skipCache: true,
  });

  const { setLastMappingId } = useLastTender();

  // Simple part selection state
  const [selectedPart, setSelectedPart] = useState<InboxTenderPart | null>(
    null
  );

  // Auto-select first part when parts are available
  useEffect(() => {
    if (!selectedPart && mapping) {
      const parts = getOverviewParts(mapping);
      if (parts.length > 0) {
        setSelectedPart(parts[0]);
      }
    }
  }, [selectedPart, mapping]);

  const handlePartSelect = useCallback(
    (partId: string) => {
      if (!mapping) return;
      const parts = getOverviewParts(mapping);
      const part = parts.find((p) => p.id === partId);
      if (part) {
        setSelectedPart(part);
      }
    },
    [mapping]
  );

  const mapStatusToStep = (
    status: string | null | undefined,
    docsReady: boolean = false
  ): "overview" | "documents-preparing" | "documents-ready" => {
    // Analysis column: analysis, questions_in_review_mimira, questions
    if (
      status === MappingStatus.analysis ||
      status === MappingStatus.questions_in_review_mimira ||
      status === MappingStatus.questions
    ) {
      return "overview";
    }

    // Documents preparing: (documents_preparing OR documents_reviewed) AND !docs_ready
    if (
      (status === MappingStatus.documents_preparing ||
        status === MappingStatus.documents_reviewed) &&
      !docsReady
    ) {
      return "documents-preparing";
    }

    // Documents ready: documents_ready OR ((documents_preparing OR documents_reviewed) AND docs_ready)
    if (
      status === MappingStatus.documents_ready ||
      ((status === MappingStatus.documents_preparing ||
        status === MappingStatus.documents_reviewed) &&
        docsReady)
    ) {
      return "documents-ready";
    }

    // Decision/Rejected states
    if (
      status === MappingStatus.decision_made_applied ||
      status === MappingStatus.decision_made_rejected ||
      status === MappingStatus.rejected
    ) {
      return "documents-ready";
    }

    return "overview";
  };

  const initialStep = useMemo(() => {
    if (isLoading || !mapping) return null;

    const status = mapping.status ?? MappingStatus.analysis;
    const docsReady = mapping.docs_ready ?? false;

    return mapStatusToStep(status, docsReady);
  }, [isLoading, mapping]);

  useEffect(() => {
    if (mapping) {
      setLastMappingId(mapping.id);
    }
  }, [mapping, setLastMappingId]);

  const partSteps = ["overview"];

  if (!initialStep) return null;

  return (
    <main className="w-full h-full bg-primary-gradient">
      <Stepper.Provider initialStep={initialStep} className="h-full">
        {({ methods }) => {
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
                        index <
                        methods.all.findIndex(
                          (s) => s.id === methods.current.id
                        )
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
                    <StepperContent
                      mapping={mapping}
                      selectedPart={selectedPart}
                    />
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
