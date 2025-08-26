"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { CalendarClock, Building2, MapPin, Package } from "lucide-react";
import { truncate } from "lodash-es";
import { memo } from "react";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "$/components/ui/context-menu";
import { useUpdateTenderStatus } from "../api";
import { toast } from "sonner";
import Link from "$/components/ui/link";
import { IndividualTenderMapping } from "../api/use-individual-tender";
import { getOverviewParts } from "../utils/parts";

interface TenderCardProps {
  mapping: IndividualTenderMapping;
  isDragging?: boolean;
}

function InternalTenderCard({ mapping, isDragging = false }: TenderCardProps) {
  const { relativeToNow } = useDateFormat();
  const { mutate: updateTenderStatus } = useUpdateTenderStatus();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: mapping.id,
    disabled: isDragging,
    data: {
      type: "Task",
      task: mapping,
    },
  });

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
    transformOrigin: "0 0",
    willChange: "transform",
  };

  const parts = getOverviewParts(mapping);

  function handleRestoreToInbox() {
    updateTenderStatus(
      {
        mappingId: mapping.id,
        status: "default",
        partsStatus: "default",
        partIds: parts.map((p) => p.id),
        requirementStatus: {
          from: "approve",
          to: "default",
        },
      },
      {
        onSuccess: () => toast.success(<span>Tender restored to inbox</span>),
      }
    );
  }

  return (
    <ContextMenu>
      <Card
        as={Link}
        href={`/dashboard/tenders/${mapping.id}`}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing hover:cursor-pointer border border-border/70 w-full transition-colors hover:bg-muted/50`}
        shadow="none"
        radius="sm"
      >
        <ContextMenuTrigger>
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-1">
              {parts.length > 0 && (
                <Chip
                  color="primary"
                  size="sm"
                  variant="flat"
                  startContent={<Package className="w-3 h-3 ml-1 mr-0.5" />}
                >
                  {parts.length}
                </Chip>
              )}
              <h4 className="text-sm font-medium line-clamp-2 text-left">
                {truncate(mapping.tenders?.order_object || "Untitled Tender", {
                  length: 60,
                })}
              </h4>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-3">
            <div className="space-y-2 text-xs text-muted-foreground text-left">
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span className="line-clamp-1 text-left">
                  {mapping.tenders?.organization_name || "Unknown Organization"}
                </span>
              </div>

              {mapping.tenders?.organization_city && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-left">
                    {mapping.tenders?.organization_city}
                  </span>
                </div>
              )}

              {mapping.tenders?.submitting_offers_date && (
                <div className="flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  <span className="text-left">
                    {relativeToNow(
                      new Date(mapping.tenders?.submitting_offers_date)
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </ContextMenuTrigger>
      </Card>
      <ContextMenuContent>
        <ContextMenuItem onSelect={handleRestoreToInbox} className="text-sm">
          <span>Restore to inbox</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const TenderCard = memo(InternalTenderCard, (prev, next) => {
  return (
    prev.mapping.id === next.mapping.id && prev.isDragging === next.isDragging
  );
});
