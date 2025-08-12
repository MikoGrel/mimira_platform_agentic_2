"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Tables } from "$/types/supabase";
import { TenderCard } from "./tender-card";
import { LucideIcon } from "lucide-react";

type TenderWithParts = Tables<"tenders"> & {
  tender_parts: Tables<"tender_parts">[];
};

interface KanbanColumnProps {
  id: string;
  title: string;
  tenders: TenderWithParts[];
  icon: LucideIcon;
  iconColor: string;
}

export function KanbanColumn({
  id,
  title,
  tenders,
  icon: Icon,
  iconColor,
}: KanbanColumnProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} className="h-full">
      <SortableContext id={id} items={tenders} strategy={rectSortingStrategy}>
        <Card
          className={`h-full bg-sidebar ${isOver ? "ring-1 ring-primary/50" : ""}`}
          shadow="none"
          radius="sm"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 w-full text-sm text-muted-foreground font-medium">
              <Icon className={`w-4 h-4 ${iconColor}`} />
              <h3 className="text-foreground font-medium">{title}</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {tenders.length}
              </span>
            </div>
          </CardHeader>
          <CardBody
            className={`pt-1 ${active ? "overflow-hidden" : "overflow-y-auto"}`}
          >
            <div className="min-h-[400px] space-y-3">
              {tenders.map((tender) => (
                <TenderCard key={tender.id} tender={tender} />
              ))}
              {tenders.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  No tenders
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </SortableContext>
    </div>
  );
}
