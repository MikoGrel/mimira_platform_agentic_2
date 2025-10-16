"use client";

import { useMemo } from "react";

import { KanbanColumn } from "./kanban-column";
import { Search, FileText, CheckCircle, X, FileCheck2 } from "lucide-react";
import { useTendersList } from "../api";
import { FilterQuery } from "$/features/inbox/hooks/use-filter-form";
import { IndividualTenderMapping } from "../api/use-individual-tender";
import { MappingStatus } from "../constants/status";

const COLUMNS = [
  {
    id: "analysis",
    title: <>Analysis</>,
    filter: (mapping: IndividualTenderMapping) =>
      mapping.status === MappingStatus.analysis ||
      mapping.status === MappingStatus.questions_in_review_mimira ||
      mapping.status === MappingStatus.questions,
    updateStatus: MappingStatus.analysis,
    icon: Search,
    color: "text-amber-500",
  },
  {
    id: "documents",
    title: <>Preparing documents</>,
    filter: (mapping: IndividualTenderMapping) =>
      (mapping.status === MappingStatus.documents_preparing ||
        mapping.status === MappingStatus.documents_reviewed) &&
      !mapping.docs_ready,
    updateStatus: MappingStatus.documents_ready,
    icon: FileText,
    color: "text-cyan-500",
  },
  {
    id: "documents_ready",
    title: <>Documents ready</>,
    filter: (mapping: IndividualTenderMapping) =>
      mapping.status === MappingStatus.documents_ready ||
      ((mapping.status === MappingStatus.documents_preparing ||
        mapping.status === MappingStatus.documents_reviewed) &&
        mapping.docs_ready),
    updateStatus: MappingStatus.documents_ready,
    icon: FileCheck2,
    color: "text-emerald-500",
  },
  {
    id: "decision",
    title: <>Decision</>,
    filter: (mapping: IndividualTenderMapping) =>
      mapping.status === MappingStatus.decision_made_applied,
    updateStatus: MappingStatus.decision_made_applied,
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    id: "rejected",
    title: <>Rejected</>,
    filter: (mapping: IndividualTenderMapping) =>
      mapping.status === MappingStatus.rejected ||
      mapping.status === MappingStatus.decision_made_rejected,
    updateStatus: MappingStatus.rejected,
    icon: X,
    color: "text-red-500",
  },
] as const;

type ColumnId = (typeof COLUMNS)[number]["id"];

interface TenderKanbanProps {
  searchQuery?: string;
  filterQuery?: FilterQuery;
}

export function TenderKanban({ searchQuery, filterQuery }: TenderKanbanProps) {
  const { tenders: fetchedTenders, isPending } = useTendersList({
    search: searchQuery,
    filterQuery,
  });

  // Use server-backed list directly so optimistic updates reflect immediately
  const allTenders = useMemo(() => fetchedTenders, [fetchedTenders]);

  const mappingsByColumn = useMemo(() => {
    const grouped: Record<ColumnId, IndividualTenderMapping[]> = {
      analysis: [],
      documents: [],
      documents_ready: [],
      decision: [],
      rejected: [],
    };

    allTenders.forEach((mapping) => {
      const column = COLUMNS.find((col) => col.filter(mapping));
      if (column) {
        grouped[column.id].push(mapping);
      }
    });

    return grouped;
  }, [allTenders]);

  const isLoading = isPending && fetchedTenders.length === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-full">
      {COLUMNS.map((column) => (
        <KanbanColumn
          key={column.id}
          title={column.title}
          mappings={mappingsByColumn[column.id]}
          icon={column.icon}
          iconColor={column.color}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
