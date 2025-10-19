"use client";

import React from "react";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { TenderCard } from "./tender-card";
import { LucideIcon } from "lucide-react";
import { IndividualTenderMapping } from "../api/use-individual-tender";

interface KanbanColumnProps {
  title: React.ReactNode;
  mappings: IndividualTenderMapping[];
  icon: LucideIcon;
  iconColor: string;
  isLoading?: boolean;
  markAsFavorite: (id: string, value: boolean) => Promise<void>;
}

function InternalKanbanColumn({
  title,
  mappings,
  icon: Icon,
  iconColor,
  isLoading = false,
  markAsFavorite,
}: KanbanColumnProps) {
  return (
    <div className="h-full min-w-[200px]">
      <Card className="h-full bg-accent/50" shadow="none" radius="sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 w-full text-sm text-muted-foreground font-medium">
            <Icon className={`w-4 h-4 ${iconColor}`} />
            <h3 className="text-foreground font-medium text-xs xl:text-sm">
              {title}
            </h3>
            <div className="ml-auto flex items-center gap-2">
              {isLoading && <Spinner color="default" size="sm" />}
              <span className="text-xs text-muted-foreground">
                {mappings.length}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="space-y-3">
            {!isLoading && (
              <>
                {mappings.map((mapping) => (
                  <TenderCard
                    key={mapping.id}
                    mapping={mapping}
                    markAsFavorite={markAsFavorite}
                  />
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
    </div>
  );
}

export const KanbanColumn = React.memo(InternalKanbanColumn, (prev, next) => {
  const prevMappings = prev.mappings
    .map((mapping) => mapping.id + mapping.marked_as_favorite)
    .join(".");
  const nextMappings = next.mappings
    .map((mapping) => mapping.id + mapping.marked_as_favorite)
    .join(".");

  return (
    prev.title === next.title &&
    prev.isLoading === next.isLoading &&
    prevMappings === nextMappings
  );
});
