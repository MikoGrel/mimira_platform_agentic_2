"use client";

import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { IndividualTenderPart } from "$/features/tenders/api/use-individual-tender";
import { cn } from "$/lib/utils";
import { truncate } from "lodash-es";

interface PartsSidebarProps {
  parts: IndividualTenderPart[];
  selectedPart: IndividualTenderPart | null;
  onPartSelect: (partId: string) => void;
  fullTenderStep?: boolean;
}

const statusMap = {
  approve: <>Approved</>,
  analysis: <>Analysis</>,
  rejected: <>Rejected</>,
};

export function PartsSidebar({
  parts,
  selectedPart,
  onPartSelect,
  fullTenderStep = false,
}: PartsSidebarProps) {
  return (
    <aside className="border-r border-sidebar-border w-[450px] h-full bg-background">
      <div className="p-4 border-b border-sidebar-border">
        <h3 className="text-sm font-semibold mb-1">Tender Parts</h3>
        <p className="text-xs text-muted-foreground">
          {parts.length} parts in analysis
        </p>
      </div>

      <div className="overflow-y-auto relative min-h-[300px]">
        {parts.length === 0 && (
          <div className="absolute top-0 left-0 w-full h-full bg-background/80 z-10 flex flex-center">
            <Chip variant="flat" color="primary">
              This tender has only one part
            </Chip>
          </div>
        )}
        {fullTenderStep && parts.length > 1 && (
          <div className="absolute top-0 left-0 w-full h-full bg-background/80 z-10 flex flex-center">
            <Chip variant="flat" color="primary">
              This step regards full tender
            </Chip>
          </div>
        )}
        {parts.map((part) => (
          <Card
            isDisabled={fullTenderStep}
            key={part.id}
            isPressable
            isHoverable
            shadow="sm"
            radius="none"
            className={cn(
              "cursor-pointer w-full transition-all duration-200 border-b border-sidebar-border",
              {
                "border-l border-l-primary font-medium":
                  selectedPart?.id === part.id,
              }
            )}
            onPress={() => onPartSelect(part.id)}
          >
            <CardHeader className="pb-1 px-3 pt-3 flex flex-col gap-1">
              <h4 className="text-left line-clamp-2 text-font-base w-full text-sm">
                {part.part_name
                  ? truncate(part.part_name, { length: 60 })
                  : `Part ${part.order_number}`}
              </h4>
            </CardHeader>
            <CardBody className="pt-0 px-3 pb-3 text-muted-foreground">
              <div className="space-y-2">
                <div className="flex items-center justify-between mt-1">
                  <Chip
                    size="sm"
                    variant="flat"
                    color="success"
                    className="text-xs"
                  >
                    {statusMap[part.status as keyof typeof statusMap]}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </aside>
  );
}
