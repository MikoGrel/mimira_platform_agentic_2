"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { Tables } from "$/types/supabase";
import { TenderCard } from "./tender-card";
import { LucideIcon } from "lucide-react";

type TenderWithParts = Tables<"tenders"> & {
  tender_parts: Tables<"tender_parts">[];
};

interface KanbanColumnProps {
  id: string;
  title: React.ReactNode;
  tenders: TenderWithParts[];
  icon: LucideIcon;
  iconColor: string;
  isLoading?: boolean;
}

function InternalKanbanColumn({
  id,
  title,
  tenders,
  icon: Icon,
  iconColor,
  isLoading = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    data: {
      type: "Column",
      column: { id, title },
    },
  });

  const tenderIds = tenders.map((tender) => tender.id);

  return (
    <div ref={setNodeRef} className="h-full min-w-[200px]">
      <SortableContext items={tenderIds} strategy={rectSortingStrategy}>
        <Card
          className={`h-full bg-sidebar ${isOver ? "ring-1 ring-primary/50" : ""}`}
          shadow="none"
          radius="sm"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 w-full text-sm text-muted-foreground font-medium">
              <Icon className={`w-4 h-4 ${iconColor}`} />
              <h3 className="text-foreground font-medium">{title}</h3>
              <div className="ml-auto flex items-center gap-2">
                {isLoading && <Spinner color="default" size="sm" />}
                <span className="text-xs text-muted-foreground">
                  {tenders.length}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardBody
            className={`pt-1 ${active ? "overflow-hidden" : "overflow-y-auto"} max-h-[calc(100vh-200px)]`}
          >
            <div className="space-y-3">
              {!isLoading && (
                <>
                  {tenders.map((tender) => (
                    <TenderCard key={tender.id} tender={tender} />
                  ))}
                  {tenders.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                      <span>No tenders</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </SortableContext>
    </div>
  );
}

export const KanbanColumn = React.memo(InternalKanbanColumn, (prev, next) => {
  const prevTenders = prev.tenders.map((tender) => tender.id).join(".");
  const nextTenders = next.tenders.map((tender) => tender.id).join(".");

  return (
    prev.id === next.id &&
    prev.title === next.title &&
    prev.isLoading === next.isLoading &&
    prevTenders === nextTenders
  );
});
