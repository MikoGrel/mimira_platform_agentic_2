"use client";

import { Button } from "@heroui/react";
import { MoveRight } from "lucide-react";
import { BentoCard } from "$/components/ui/bento-card";
import { useIndividualTender } from "$/features/tenders";
import Link from "next/link";
import truncate from "lodash-es/truncate";
import { defineStepper } from "$/components/stepper";
import { useLastTender } from "$/features/tenders/hooks/use-last-tender";
import { MappingStatus } from "$/features/tenders/constants/status";

interface LastTenderBentoProps {
  loading?: boolean;
  className?: string;
}

export function LastTenderBento({ loading, className }: LastTenderBentoProps) {
  const { lastMappingId } = useLastTender();

  const { data: mapping } = useIndividualTender({
    mappingId: lastMappingId!,
    enabled: !!lastMappingId,
  });

  const isInInbox = mapping?.status === MappingStatus.default;

  const getCurrentStep = () => {
    if (!mapping?.status) return undefined;

    if (mapping.status === MappingStatus.default) return "preview";
    if (mapping.status === MappingStatus.decision_made_applied)
      return "application";

    return "filling-out";
  };

  const { Stepper } = defineStepper(
    {
      id: "preview",
      title: <>Preview</>,
    },
    {
      id: "filling-out",
      title: <>Filling-out data</>,
    },
    {
      id: "application",
      title: <>Application</>,
    }
  );

  return (
    <BentoCard
      loading={loading}
      title={<span>Return to last tender</span>}
      className={className}
      bodyClassName="flex flex-col gap-4 pt-0"
    >
      {!mapping && (
        <div className="w-full h-full bg-sidebar flex flex-center rounded-lg">
          <p className="text-muted-foreground text-xs">
            You will see your recently visited tender here
          </p>
        </div>
      )}
      {mapping && (
        <>
          <p>
            {truncate(mapping?.tenders.order_object || "", { length: 100 })}
          </p>

          <Stepper.Provider
            variant="vertical"
            initialStep={getCurrentStep()}
            className="flex-1"
          >
            {({ methods }) => (
              <Stepper.Navigation
                aria-label="Tender Progress Steps"
                className="h-full"
              >
                {methods.all.map((step) => (
                  <Stepper.Step of={step.id} key={step.id}>
                    <Stepper.Title>{step.title}</Stepper.Title>
                  </Stepper.Step>
                ))}
              </Stepper.Navigation>
            )}
          </Stepper.Provider>
          <Button
            as={Link}
            href={
              isInInbox
                ? `/dashboard/inbox?id=${mapping?.id}`
                : `/dashboard/tenders/${mapping?.id}`
            }
            color="primary"
            endContent={<MoveRight />}
          >
            Continue
          </Button>
        </>
      )}
    </BentoCard>
  );
}
