"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Active, DataRef, Over } from "@dnd-kit/core";

import { TenderCard } from "./tender-card";
import { KanbanColumn } from "./kanban-column";
import {
  Search,
  MessageCircleQuestion,
  FileText,
  CheckCircle,
  X,
} from "lucide-react";
import { useTendersList, useUpdateTenderStatus } from "../api";
import { FilterQuery } from "$/features/inbox/hooks/use-filter-form";
import { IndividualTenderMapping } from "../api/use-individual-tender";

const COLUMNS = [
  {
    id: "analysis",
    title: <>Analysis</>,
    statuses: ["analysis"] as const,
    icon: Search,
    color: "text-amber-500",
  },
  {
    id: "questions",
    title: <>Questions & Review</>,
    statuses: ["questions_in_review_mimira", "questions"] as const,
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
    icon: FileText,
    color: "text-cyan-500",
  },
  {
    id: "decision",
    title: <>Decision</>,
    statuses: ["decision_made_applied", "decision_made_rejected"] as const,
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    id: "rejected",
    title: <>Rejected</>,
    statuses: ["rejected"] as const,
    icon: X,
    color: "text-red-500",
  },
] as const;

type ColumnId = (typeof COLUMNS)[number]["id"];

type ColumnDragData = {
  type: "Column";
  column: { id: string; title: string };
};

type TaskDragData = {
  type: "Task";
  task: IndividualTenderMapping;
};

type DraggableData = ColumnDragData | TaskDragData;

function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === "Column" || data?.type === "Task") {
    return true;
  }

  return false;
}

interface TenderKanbanProps {
  searchQuery?: string;
  filterQuery?: FilterQuery;
}

export function TenderKanban({ searchQuery, filterQuery }: TenderKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const updateTenderStatus = useUpdateTenderStatus();

  const {
    tenders: fetchedTenders,
    isPending,
    updateTenderStatus: optimisticUpdate,
  } = useTendersList({
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

  const activeMapping = useMemo(() => {
    if (!activeId) return null;
    return allTenders.find((mapping) => mapping.id === activeId) || null;
  }, [activeId, allTenders]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getColumnForTender = (mapping: IndividualTenderMapping) => {
    return (
      COLUMNS.find((col) =>
        (col.statuses as readonly string[]).includes(
          mapping.status ?? "default"
        )
      ) || COLUMNS[0]
    ); // Default to first column
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;

    if (data?.type === "Task") {
      setActiveId(event.active.id as string);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      const activeTask = allTenders.find((m) => m.id === activeId);
      const overTask = allTenders.find((m) => m.id === overId);

      if (activeTask && overTask) {
        const activeColumn = getColumnForTender(activeTask);
        const overColumn = getColumnForTender(overTask);

        if (activeColumn.id !== overColumn.id) {
          const newStatus = overColumn.statuses[0];
          optimisticUpdate(activeId as string, newStatus);
          updateTenderStatus.mutate({
            mappingId: activeId as string,
            status: newStatus,
          });
        } else {
          // Same-column reordering removed by request; do nothing
        }
      }
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      const activeTask = allTenders.find((m) => m.id === activeId);

      if (activeTask) {
        const targetColumn = COLUMNS.find((col) => col.id === overId);
        if (targetColumn) {
          const newStatus = targetColumn.statuses[0];
          optimisticUpdate(activeId as string, newStatus);
          updateTenderStatus.mutate({
            mappingId: activeId as string,
            status: newStatus,
          });
        }
      }
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  const isLoading = isPending && fetchedTenders.length === 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-full">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            mappings={mappingsByColumn[column.id]}
            icon={column.icon}
            iconColor={column.color}
            isLoading={isLoading}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeMapping ? (
          <TenderCard mapping={activeMapping} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
