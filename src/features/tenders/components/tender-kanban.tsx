"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  KeyboardSensor,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { Tables } from "$/types/supabase";
import { TenderCard } from "./tender-card";
import { KanbanColumn } from "./kanban-column";
import {
  Search,
  MessageCircleQuestion,
  FileText,
  CheckCircle,
  X,
} from "lucide-react";

// Define the kanban columns based on tender status
const COLUMNS = [
  {
    id: "analysis",
    title: "Analysis",
    statuses: ["analysis"] as const,
    icon: Search,
    color: "text-amber-500",
  },
  {
    id: "questions",
    title: "Questions & Review",
    statuses: ["questions_in_review_mimira", "questions"] as const,
    icon: MessageCircleQuestion,
    color: "text-purple-500",
  },
  {
    id: "documents",
    title: "Documents",
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
    title: "Decision",
    statuses: ["decision_made_applied", "decision_made_rejected"] as const,
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    id: "rejected",
    title: "Rejected",
    statuses: ["rejected"] as const,
    icon: X,
    color: "text-red-500",
  },
] as const;

type ColumnId = (typeof COLUMNS)[number]["id"];
type TenderWithParts = Tables<"tenders"> & {
  tender_parts: Tables<"tender_parts">[];
};

// Mock data for development
const mockTenders: TenderWithParts[] = [
  {
    id: "1",
    application_form_llm: null,
    can_participate: true,
    company: "Test Company",
    contract_penalties_llm: null,
    deposit_llm: null,
    description_long_llm: null,
    has_parts: true,
    met_requirements: null,
    needs_confirmation_requirements: null,
    not_met_requirements: null,
    ordercompletiondate_llm: null,
    orderobject: "Supply of Office Equipment and Furniture",
    organizationcity: "Warsaw",
    organizationname: "City Hall Warsaw",
    payment_terms_llm: null,
    publicationdate: "2024-01-15",
    review_criteria_llm: null,
    seen_at: null,
    status: "default",
    submittingoffersdate: "2024-02-15",
    url: null,
    url_user: null,
    voivodship: "mazowieckie",
    wadium_llm: null,
    tender_parts: [
      {
        part_uuid: "1-1",
        part_name: "Office Chairs",
        part_id: 1,
        can_participate: true,
        status: "active",
        tender_id: "1",
        description_part_long_llm: null,
        met_requirements: null,
        needs_confirmation_requirements: null,
        not_met_requirements: null,
        ordercompletiondate_llm: null,
        review_criteria_llm: null,
        wadium_llm: null,
      },
      {
        part_uuid: "1-2",
        part_name: "Desks",
        part_id: 2,
        can_participate: true,
        status: "active",
        tender_id: "1",
        description_part_long_llm: null,
        met_requirements: null,
        needs_confirmation_requirements: null,
        not_met_requirements: null,
        ordercompletiondate_llm: null,
        review_criteria_llm: null,
        wadium_llm: null,
      },
      {
        part_uuid: "1-3",
        part_name: "Filing Cabinets",
        part_id: 3,
        can_participate: true,
        status: "active",
        tender_id: "1",
        description_part_long_llm: null,
        met_requirements: null,
        needs_confirmation_requirements: null,
        not_met_requirements: null,
        ordercompletiondate_llm: null,
        review_criteria_llm: null,
        wadium_llm: null,
      },
    ],
  },
  {
    id: "2",
    application_form_llm: null,
    can_participate: true,
    company: "Test Company",
    contract_penalties_llm: null,
    deposit_llm: null,
    description_long_llm: null,
    has_parts: true,
    met_requirements: null,
    needs_confirmation_requirements: null,
    not_met_requirements: null,
    ordercompletiondate_llm: null,
    orderobject: "Construction of New Library Building",
    organizationcity: "Krakow",
    organizationname: "Municipality of Krakow",
    payment_terms_llm: null,
    publicationdate: "2024-01-20",
    review_criteria_llm: null,
    seen_at: null,
    status: "analysis",
    submittingoffersdate: "2024-03-01",
    url: null,
    url_user: null,
    voivodship: "małopolskie",
    wadium_llm: null,
    tender_parts: [
      {
        part_uuid: "2-1",
        part_name: "Foundation Work",
        part_id: 1,
        can_participate: true,
        status: "active",
        tender_id: "2",
        description_part_long_llm: null,
        met_requirements: null,
        needs_confirmation_requirements: null,
        not_met_requirements: null,
        ordercompletiondate_llm: null,
        review_criteria_llm: null,
        wadium_llm: null,
      },
      {
        part_uuid: "2-2",
        part_name: "Structural Framework",
        part_id: 2,
        can_participate: true,
        status: "active",
        tender_id: "2",
        description_part_long_llm: null,
        met_requirements: null,
        needs_confirmation_requirements: null,
        not_met_requirements: null,
        ordercompletiondate_llm: null,
        review_criteria_llm: null,
        wadium_llm: null,
      },
    ],
  },
  {
    id: "3",
    application_form_llm: null,
    can_participate: true,
    company: "Test Company",
    contract_penalties_llm: null,
    deposit_llm: null,
    description_long_llm: null,
    has_parts: false,
    met_requirements: null,
    needs_confirmation_requirements: null,
    not_met_requirements: null,
    ordercompletiondate_llm: null,
    orderobject: "IT Services for Government Agency",
    organizationcity: "Gdansk",
    organizationname: "Regional Office Gdansk",
    payment_terms_llm: null,
    publicationdate: "2024-01-10",
    review_criteria_llm: null,
    seen_at: null,
    status: "questions",
    submittingoffersdate: "2024-02-28",
    url: null,
    url_user: null,
    voivodship: "pomorskie",
    wadium_llm: null,
    tender_parts: [
      {
        part_uuid: "4-1",
        part_name: "Medical Equipment",
        part_id: 1,
        can_participate: true,
        status: "active",
        tender_id: "4",
        description_part_long_llm: null,
        met_requirements: null,
        needs_confirmation_requirements: null,
        not_met_requirements: null,
        ordercompletiondate_llm: null,
        review_criteria_llm: null,
        wadium_llm: null,
      },
    ],
  },
  {
    id: "4",
    application_form_llm: null,
    can_participate: true,
    company: "Test Company",
    contract_penalties_llm: null,
    deposit_llm: null,
    description_long_llm: null,
    has_parts: true,
    met_requirements: null,
    needs_confirmation_requirements: null,
    not_met_requirements: null,
    ordercompletiondate_llm: null,
    orderobject: "Medical Equipment Procurement",
    organizationcity: "Wroclaw",
    organizationname: "Hospital Wroclaw",
    payment_terms_llm: null,
    publicationdate: "2024-01-05",
    review_criteria_llm: null,
    seen_at: null,
    status: "rejected",
    submittingoffersdate: "2024-02-10",
    url: null,
    url_user: null,
    voivodship: "dolnośląskie",
    wadium_llm: null,
    tender_parts: [],
  },
  {
    id: "5",
    application_form_llm: null,
    can_participate: true,
    company: "Test Company",
    contract_penalties_llm: null,
    deposit_llm: null,
    description_long_llm: null,
    has_parts: true,
    met_requirements: null,
    needs_confirmation_requirements: null,
    not_met_requirements: null,
    ordercompletiondate_llm: null,
    orderobject: "Road Infrastructure Maintenance Services",
    organizationcity: "Poznan",
    organizationname: "City of Poznan",
    payment_terms_llm: null,
    publicationdate: "2024-01-25",
    review_criteria_llm: null,
    seen_at: null,
    status: "default",
    submittingoffersdate: "2024-03-15",
    url: null,
    url_user: null,
    voivodship: "wielkopolskie",
    wadium_llm: null,
    tender_parts: [],
  },
  {
    id: "6",
    application_form_llm: null,
    can_participate: true,
    company: "Test Company",
    contract_penalties_llm: null,
    deposit_llm: null,
    description_long_llm: null,
    has_parts: false,
    met_requirements: null,
    needs_confirmation_requirements: null,
    not_met_requirements: null,
    ordercompletiondate_llm: null,
    orderobject: "Educational Software Implementation",
    organizationcity: "Lublin",
    organizationname: "University of Lublin",
    payment_terms_llm: null,
    publicationdate: "2024-01-12",
    review_criteria_llm: null,
    seen_at: null,
    status: "questions_in_review_mimira",
    submittingoffersdate: "2024-02-25",
    url: null,
    url_user: null,
    voivodship: "lubelskie",
    wadium_llm: null,
    tender_parts: [],
  },
  {
    id: "7",
    application_form_llm: null,
    can_participate: true,
    company: "Test Company",
    contract_penalties_llm: null,
    deposit_llm: null,
    description_long_llm: null,
    has_parts: true,
    met_requirements: null,
    needs_confirmation_requirements: null,
    not_met_requirements: null,
    ordercompletiondate_llm: null,
    orderobject: "Green Energy Infrastructure Project",
    organizationcity: "Katowice",
    organizationname: "City of Katowice",
    payment_terms_llm: null,
    publicationdate: "2024-01-08",
    review_criteria_llm: null,
    seen_at: null,
    status: "documents_preparing",
    submittingoffersdate: "2024-03-05",
    url: null,
    url_user: null,
    voivodship: "śląskie",
    wadium_llm: null,
    tender_parts: [],
  },
  {
    id: "8",
    application_form_llm: null,
    can_participate: true,
    company: "Test Company",
    contract_penalties_llm: null,
    deposit_llm: null,
    description_long_llm: null,
    has_parts: false,
    met_requirements: null,
    needs_confirmation_requirements: null,
    not_met_requirements: null,
    ordercompletiondate_llm: null,
    orderobject: "Public Transportation System Upgrade",
    organizationcity: "Szczecin",
    organizationname: "Transport Authority Szczecin",
    payment_terms_llm: null,
    publicationdate: "2024-01-18",
    review_criteria_llm: null,
    seen_at: null,
    status: "documents_ready",
    submittingoffersdate: "2024-02-20",
    url: null,
    url_user: null,
    voivodship: "zachodniopomorskie",
    wadium_llm: null,
    tender_parts: [],
  },
  {
    id: "9",
    application_form_llm: null,
    can_participate: true,
    company: "Test Company",
    contract_penalties_llm: null,
    deposit_llm: null,
    description_long_llm: null,
    has_parts: true,
    met_requirements: null,
    needs_confirmation_requirements: null,
    not_met_requirements: null,
    ordercompletiondate_llm: null,
    orderobject: "Healthcare Management System",
    organizationcity: "Białystok",
    organizationname: "Regional Hospital Białystok",
    payment_terms_llm: null,
    publicationdate: "2024-01-22",
    review_criteria_llm: null,
    seen_at: null,
    status: "documents_reviewed",
    submittingoffersdate: "2024-03-10",
    url: null,
    url_user: null,
    voivodship: "podlaskie",
    wadium_llm: null,
    tender_parts: [],
  },
  {
    id: "10",
    application_form_llm: null,
    can_participate: true,
    company: "Test Company",
    contract_penalties_llm: null,
    deposit_llm: null,
    description_long_llm: null,
    has_parts: false,
    met_requirements: null,
    needs_confirmation_requirements: null,
    not_met_requirements: null,
    ordercompletiondate_llm: null,
    orderobject: "Digital Security Infrastructure",
    organizationcity: "Toruń",
    organizationname: "Toruń Municipality",
    payment_terms_llm: null,
    publicationdate: "2024-01-28",
    review_criteria_llm: null,
    seen_at: null,
    status: "decision_made_applied",
    submittingoffersdate: "2024-02-18",
    url: null,
    url_user: null,
    voivodship: "kujawsko-pomorskie",
    wadium_llm: null,
    tender_parts: [],
  },
  {
    id: "11",
    application_form_llm: null,
    can_participate: true,
    company: "Test Company",
    contract_penalties_llm: null,
    deposit_llm: null,
    description_long_llm: null,
    has_parts: true,
    met_requirements: null,
    needs_confirmation_requirements: null,
    not_met_requirements: null,
    ordercompletiondate_llm: null,
    orderobject: "Water Treatment Facility Maintenance",
    organizationcity: "Rzeszów",
    organizationname: "Rzeszów Water Company",
    payment_terms_llm: null,
    publicationdate: "2024-01-30",
    review_criteria_llm: null,
    seen_at: null,
    status: "decision_made_rejected",
    submittingoffersdate: "2024-02-12",
    url: null,
    url_user: null,
    voivodship: "podkarpackie",
    wadium_llm: null,
    tender_parts: [],
  },
];

export function TenderKanban() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tenders, setTenders] = useState<TenderWithParts[]>(mockTenders);

  const allTenders = useMemo(() => tenders, [tenders]);

  const tendersByColumn = useMemo(() => {
    const grouped: Record<ColumnId, TenderWithParts[]> = {
      analysis: [],
      questions: [],
      documents: [],
      decision: [],
      rejected: [],
    };

    allTenders.forEach((tender) => {
      const column = COLUMNS.find((col) =>
        col.statuses.some((status) => status === tender.status)
      );
      if (column) {
        grouped[column.id].push(tender);
      } else {
        grouped.analysis.push(tender);
      }
    });

    return grouped;
  }, [allTenders]);

  const activeTender = useMemo(() => {
    if (!activeId) return null;
    return allTenders.find((tender) => tender.id === activeId) || null;
  }, [activeId, allTenders]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = (unique: string | null) => {
    if (!unique) {
      return null;
    }
    // Check if over target is a column
    if (COLUMNS.some((c) => c.id === unique)) {
      return COLUMNS.find((c) => c.id === unique) ?? null;
    }
    // Find which column contains this tender
    const id = String(unique);
    const column = COLUMNS.find((col) =>
      col.statuses.some((status) =>
        allTenders.some(
          (tender) => tender.id === id && tender.status === status
        )
      )
    );
    return column ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return null;
    }

    setTenders((prevTenders) => {
      const newStatus = overColumn.statuses[0]; // Use first status of target column

      return prevTenders.map((tender) => {
        if (tender.id === activeId) {
          return { ...tender, status: newStatus };
        }
        return tender;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn !== overColumn) {
      setActiveId(null);
      return null;
    }

    const activeItems = allTenders.filter((tender) =>
      activeColumn.statuses.some((status) => status === tender.status)
    );

    const activeIndex = activeItems.findIndex((i) => i.id === activeId);
    const overIndex = activeItems.findIndex((i) => i.id === overId);

    if (activeIndex !== overIndex) {
      setTenders((prevTenders) => {
        const reorderedItems = arrayMove(activeItems, activeIndex, overIndex);
        const otherItems = prevTenders.filter(
          (tender) =>
            !activeColumn.statuses.some((status) => status === tender.status)
        );
        return [...otherItems, ...reorderedItems];
      });
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tenders={tendersByColumn[column.id]}
            icon={column.icon}
            iconColor={column.color}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTender ? <TenderCard tender={activeTender} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
