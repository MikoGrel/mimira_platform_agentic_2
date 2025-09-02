"use client";

import { useMemo } from "react";

import { KanbanColumn } from "./kanban-column";
import {
  Search,
  MessageCircleQuestion,
  FileText,
  CheckCircle,
  X,
} from "lucide-react";
import { useTendersList } from "../api";
import { FilterQuery } from "$/features/inbox/hooks/use-filter-form";
import { IndividualTenderMapping } from "../api/use-individual-tender";

const COLUMNS = [
  {
    id: "analysis",
    title: <>Analysis</>,
    statuses: ["analysis"] as const,
    updateStatus: "analysis",
    icon: Search,
    color: "text-amber-500",
  },
  {
    id: "questions",
    title: <>Questions & Review</>,
    statuses: ["questions_in_review_mimira", "questions"] as const,
    updateStatus: "questions",
    icon: MessageCircleQuestion,
    color: "text-purple-500",
  },
  {
    id: "documents",
    title: <>Documents</>,
    statuses: [
      "documents_preparing",
      "documents_ready",
      "documents_reviewed",
    ] as const,
    updateStatus: "documents_ready",
    icon: FileText,
    color: "text-cyan-500",
  },
  {
    id: "decision",
    title: <>Decision</>,
    statuses: ["decision_made_applied"] as const,
    updateStatus: "decision_made_applied",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    id: "rejected",
    title: <>Rejected</>,
    statuses: ["rejected", "decision_made_rejected"] as const,
    updateStatus: "rejected",
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
      questions: [],
      documents: [],
      decision: [],
      rejected: [],
    };

    allTenders.forEach((mapping) => {
      const column = COLUMNS.find((col) =>
        col.statuses.some((status) => status === mapping.status)
      );
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
