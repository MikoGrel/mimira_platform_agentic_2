"use client";

import { Button } from "@heroui/react";
import { MoveRight } from "lucide-react";
import { BentoCard } from "$/components/ui/bento-card";
import { VerticalStepper } from "$/components/ui/vertical-stepper";

interface LastTenderBentoProps {
  loading?: boolean;
  className?: string;
}

export function LastTenderBento({ loading, className }: LastTenderBentoProps) {
  const tenderSteps = [
    {
      id: "preview",
      title: <>Preview</>,
      completed: true,
    },
    {
      id: "filling-out",
      title: <>Filling-out data</>,
      completed: true,
    },
    {
      id: "application",
      title: <>Application</>,
      completed: false,
      current: true,
    },
  ];

  return (
    <BentoCard
      loading={loading}
      title={<span>Return to last tender</span>}
      className={className}
      bodyClassName="flex flex-col gap-4 pt-0"
    >
      <p className="font-medium">Restocking medical equipment</p>
      <VerticalStepper steps={tenderSteps} />
      <Button color="primary" endContent={<MoveRight />}>
        Continue
      </Button>
    </BentoCard>
  );
}
