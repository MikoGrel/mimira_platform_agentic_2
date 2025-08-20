"use client";

import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { IndividualTenderPart } from "$/features/tenders/api/use-individual-tender";
import { cn } from "$/lib/utils";

interface PartsSidebarProps {
  parts: IndividualTenderPart[];
  selectedPart: IndividualTenderPart | null;
  onPartSelect: (partId: string) => void;
}

const statusMap = {
  approve: <>Approved</>,
  pending: <>Pending</>,
  rejected: <>Rejected</>,
};

export function PartsSidebar({
  parts,
  selectedPart,
  onPartSelect,
}: PartsSidebarProps) {
  return (
    <aside className="border-r border-sidebar-border w-[450px] h-full bg-background">
      <div className="p-4 border-b border-sidebar-border">
        <h3 className="text-sm font-semibold mb-1">Tender Parts</h3>
        <p className="text-xs text-muted-foreground">
          {parts.length} approved parts
        </p>
      </div>

      <div className="overflow-y-auto">
        {!parts.length && (
          <div className="flex items-center justify-center h-full py-6">
            <p className="text-xs text-muted-foreground">
              This tender has no parts
            </p>
          </div>
        )}
        {parts.map((part) => (
          <Card
            key={part.part_uuid}
            isPressable
            isHoverable
            shadow="sm"
            radius="none"
            className={cn(
              "cursor-pointer transition-all duration-200 border-b border-sidebar-border",
              {
                "border-l border-l-primary font-medium":
                  selectedPart?.part_uuid === part.part_uuid,
              }
            )}
            onPress={() => onPartSelect(part.part_uuid)}
          >
            <CardHeader className="pb-1 px-3 pt-3 flex flex-col gap-1">
              <h4 className="text-left line-clamp-2 text-font-base w-full text-sm">
                {part.part_name?.trim() || `Part ${part.part_id}`}
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
