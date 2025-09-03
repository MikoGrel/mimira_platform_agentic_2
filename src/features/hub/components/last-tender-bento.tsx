"use client";

import { Button } from "@heroui/react";
import { MoveRight } from "lucide-react";
import { BentoCard } from "$/components/ui/bento-card";
import { useIndividualTender } from "$/features/tenders";
import Link from "next/link";
import truncate from "lodash-es/truncate";
import { defineStepper } from "$/components/stepper";
import { useLastTender } from "$/features/tenders/hooks/use-last-tender";

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

  const isInInbox = mapping?.status === "default";

  const getCurrentStep = () => {
    if (!mapping?.status) return "preview";

    switch (mapping.status) {
      case "default":
        return "preview";
      case "analysis":
        return "filling-out";
      case "applied":
        return "application";
      default:
        return "preview";
    }
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
      <p>{truncate(mapping?.tenders.order_object || "", { length: 100 })}</p>

      <Stepper.Provider variant="vertical" initialStep={getCurrentStep()}>
        {({ methods }) => (
          <Stepper.Navigation aria-label="Tender Progress Steps">
            {methods.all.map((step) => (
              <div key={step.id}>
                <Stepper.Step of={step.id}>
                  <Stepper.Title>{step.title}</Stepper.Title>
                </Stepper.Step>
              </div>
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
    </BentoCard>
  );
}
