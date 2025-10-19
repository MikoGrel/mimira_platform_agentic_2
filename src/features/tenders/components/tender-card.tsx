"use client";

import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { CalendarClock, Building2, MapPin, Package, Star } from "lucide-react";
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
import { MappingStatus } from "../constants/status";
import { cn } from "$/lib/utils";

interface TenderCardProps {
  mapping: IndividualTenderMapping;
  markAsFavorite: (id: string, value: boolean) => Promise<void>;
}

function InternalTenderCard({ mapping, markAsFavorite }: TenderCardProps) {
  const { relativeToNow } = useDateFormat();
  const { mutate: updateTenderStatus } = useUpdateTenderStatus();
  const isRejected = [
    MappingStatus.rejected,
    MappingStatus.decision_made_rejected,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ].includes(mapping.status as any);

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
      <div className="relative group">
        <Card
          as={Link}
          href={isRejected ? "#" : `/dashboard/tenders/${mapping.id}`}
          className="hover:cursor-pointer border border-border/70 w-full transition-colors hover:bg-muted/50"
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
                  {mapping.marked_as_favorite && (
                    <Star className="w-3.5 h-3.5 stroke-0 fill-yellow-500 inline mb-0.5 mr-1" />
                  )}
                  {truncate(
                    mapping.tenders?.order_object || "Untitled Tender",
                    {
                      length: 60,
                    }
                  )}
                </h4>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-3">
              <div className="space-y-2 text-xs text-muted-foreground text-left">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span className="line-clamp-1 text-left">
                    {mapping.tenders?.organization_name ||
                      "Unknown Organization"}
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
                  <div
                    className={`flex items-center gap-1 ${mapping.tenders.has_offersdate_changed ? "text-warning-600" : ""}`}
                  >
                    <CalendarClock className="w-3 h-3" />
                    <span className="text-left">
                      {mapping.tenders.has_offersdate_changed && (
                        <span>New term:&nbsp;</span>
                      )}
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
        <Button
          onPress={() =>
            markAsFavorite(mapping.id, !mapping.marked_as_favorite)
          }
          isIconOnly
          variant="flat"
          color="default"
          size="sm"
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm z-10"
        >
          <Star
            className={cn("w-4 h-4 stroke-[1.5]", {
              "fill-yellow-500 stroke-0": mapping.marked_as_favorite,
            })}
          />
        </Button>
      </div>
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
    prev.mapping.id === next.mapping.id &&
    prev.mapping.marked_as_favorite === next.mapping.marked_as_favorite
  );
});
