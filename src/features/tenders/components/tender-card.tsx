"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { CalendarClock, Building2, MapPin, Package } from "lucide-react";
import { Tables } from "$/types/supabase";
import { truncate } from "lodash";
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

type TenderWithParts = Tables<"tenders"> & {
  tender_parts: Tables<"tender_parts">[];
};

interface TenderCardProps {
  tender: TenderWithParts;
  isDragging?: boolean;
}

function InternalTenderCard({ tender, isDragging = false }: TenderCardProps) {
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
    id: tender.id,
    disabled: isDragging,
    data: {
      type: "Task",
      task: tender,
    },
  });

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
    transformOrigin: "0 0",
    willChange: "transform",
  };

  function handleRestoreToInbox() {
    updateTenderStatus(
      { tenderId: tender.id, status: "default" },
      {
        onSuccess: () => toast.success(<span>Tender restored to inbox</span>),
      }
    );
  }

  return (
    <ContextMenu>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing border border-border/70 w-full transition-none`}
        shadow="none"
        radius="sm"
      >
        <ContextMenuTrigger>
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-1">
              {tender.tender_parts.length > 0 && (
                <Chip
                  color="primary"
                  size="sm"
                  variant="flat"
                  startContent={<Package className="w-3 h-3 ml-1 mr-0.5" />}
                >
                  {tender.tender_parts.length}
                </Chip>
              )}
              <h4 className="text-sm font-medium line-clamp-2 text-left">
                {truncate(tender.orderobject || "Untitled Tender", {
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
                  {tender.organizationname || "Unknown Organization"}
                </span>
              </div>

              {tender.organizationcity && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-left">{tender.organizationcity}</span>
                </div>
              )}

              {tender.submittingoffersdate && (
                <div className="flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  <span className="text-left">
                    {relativeToNow(new Date(tender.submittingoffersdate))}
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
    prev.tender.id === next.tender.id && prev.isDragging === next.isDragging
  );
});
