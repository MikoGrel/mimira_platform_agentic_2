"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { TenderCard } from "./tender-card";
import { LucideIcon } from "lucide-react";
import { IndividualTenderMapping } from "../api/use-individual-tender";

interface KanbanColumnProps {
  id: string;
  title: React.ReactNode;
  mappings: IndividualTenderMapping[];
  icon: LucideIcon;
  iconColor: string;
  isLoading?: boolean;
}

function InternalKanbanColumn({
  id,
  title,
  mappings,
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

  const tenderIds = mappings.map((mapping) => mapping.id);

  return (
    <div ref={setNodeRef} className="h-full min-w-[200px]">
      <SortableContext items={tenderIds} strategy={rectSortingStrategy}>
        <Card
          className={`h-full bg-accent/50 ${isOver ? "ring-1 ring-primary/50" : ""}`}
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
                  {mappings.length}
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
                  {mappings.map((mapping) => (
                    <TenderCard key={mapping.id} mapping={mapping} />
                  ))}
                  {mappings.length === 0 && (
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
  const prevMappings = prev.mappings.map((mapping) => mapping.id).join(".");
  const nextMappings = next.mappings.map((mapping) => mapping.id).join(".");

  return (
    prev.id === next.id &&
    prev.title === next.title &&
    prev.isLoading === next.isLoading &&
    prevMappings === nextMappings
  );
});
