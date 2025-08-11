"use client";

import {
  Button,
  Chip,
  DropdownItem,
  Dropdown,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@heroui/react";
import {
  CalendarClock,
  EllipsisVertical,
  House,
  MessageSquareText,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Tables } from "$/types/supabase";
import { useCommentsCount } from "$/features/tenders/api/use-comments-count";
import { TenderPartType } from "./tender-preview";
import { useRestoreRejectedTender } from "../api/use-restore-rejected-tender";
import { truncate } from "lodash";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { useUnseen } from "../api/use-unseen";
import { toast } from "sonner";

interface TenderHeaderProps {
  tender: NonNullable<Tables<"tenders">>;
  isHeaderCollapsed: boolean;
  setCommentsOpened: (value: boolean) => void;
  onApprovePart?: () => void;
  approvedPartIds: Set<string>;
  currentPart?: {
    item: TenderPartType | null;
    isApproved: boolean;
  };
  onUnselectAll?: () => void;
  onRemoveCurrentPart?: () => void;
  onApply: (partIds?: string[]) => void;
  onReject?: () => void;
}

interface HeaderButtonsProps {
  size?: "sm";
  tender: NonNullable<Tables<"tenders">>;
  approvedPartIds: Set<string>;
  currentPart?: {
    item: TenderPartType | null;
    isApproved: boolean;
  };
  onApprovePart?: () => void;
  onRemoveCurrentPart?: () => void;
  onApply: (partIds?: string[]) => void;
  onReject?: () => void;
  onUnselectAll?: () => void;
  setCommentsOpened: (value: boolean) => void;
  commentCount?: number;
  restoreTender: (id: string) => void;
  onUnseen: (id: string) => void;
}

function HeaderButtons({
  size,
  tender: { id: tenderId, status },
  approvedPartIds,
  currentPart,
  onApprovePart,
  onRemoveCurrentPart,
  onApply,
  onReject,
  onUnselectAll,
  setCommentsOpened,
  commentCount,
  restoreTender,
  onUnseen,
}: HeaderButtonsProps) {
  const isRejected = status === "rejected";
  const hasApprovedParts = approvedPartIds.size > 0;
  const hasCurrentPart = !!currentPart?.item;
  const isCurrentPartApproved = currentPart?.isApproved;
  const hasNoSelection = !approvedPartIds.size && !hasCurrentPart;

  if (isRejected) {
    return (
      <div className="flex gap-2">
        <Button
          size={size}
          variant="flat"
          onPress={() => restoreTender(tenderId)}
        >
          Restore
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {hasNoSelection && (
        <>
          <Button size={size} color="primary" data-lingo-override-pl="Aplikuj">
            Apply
          </Button>
          <Button size={size} variant="flat" onPress={onReject}>
            Reject
          </Button>
        </>
      )}

      {hasCurrentPart && (
        <>
          {isCurrentPartApproved ? (
            <Button size={size} color="danger" onPress={onRemoveCurrentPart}>
              Unselect
            </Button>
          ) : (
            <Button size={size} color="primary" onPress={onApprovePart}>
              Approve this part
            </Button>
          )}
        </>
      )}

      {hasApprovedParts && (
        <>
          <Button
            size={size}
            color="primary"
            onPress={() => onApply(Array.from(approvedPartIds))}
            data-lingo-override-pl="Aplikuj na wybrane części"
          >
            Apply to selected parts
          </Button>
          <Button size={size} variant="flat" onPress={onUnselectAll}>
            Unselect all
          </Button>
        </>
      )}

      <Button
        size={size}
        variant="ghost"
        onPress={() => setCommentsOpened(true)}
        className="!min-w-10"
        isIconOnly={!commentCount}
      >
        <MessageSquareText className="w-5 h-5 stroke-[1.5]" />
        {!!commentCount && commentCount}
      </Button>
      <Dropdown>
        <DropdownTrigger>
          <Button size={size} variant="bordered" isIconOnly>
            <EllipsisVertical className="w-4 h-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          onAction={(key) => {
            if (key === "unseen") {
              onUnseen(tenderId);
            }
          }}
        >
          <DropdownItem key="unseen">
            <span>Mark as unseen</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

export function TenderHeader(props: TenderHeaderProps) {
  const { tender, isHeaderCollapsed } = props;
  const [hasRendered, setHasRendered] = useState(false);
  const { count } = useCommentsCount({
    tenderId: tender.id,
  });
  const { mutate: restoreTender } = useRestoreRejectedTender({
    onSuccess: () => {
      toast.success(<span>Tender restored</span>);
    },
  });
  const { mutate: onUnseen } = useUnseen({
    onSuccess: () => {
      toast.success(<span>Tender marked as unseen</span>);
    },
  });
  const { relativeToNow } = useDateFormat();
  const isRejected = tender.status === "rejected";

  useEffect(() => {
    setHasRendered(true);
  }, []);

  const h1Variants = {
    collapsed: {
      fontSize: "16px",
      lineHeight: "20px",
    },
    expanded: {
      fontSize: "20px",
      lineHeight: "28px",
    },
  };

  return (
    <div className="border-b border-border bg-white overflow-hidden px-6 py-4">
      {isRejected && (
        <Chip color="danger" size="sm" className="mb-2" variant="flat">
          Rejected
        </Chip>
      )}

      <Tooltip
        placement="bottom-start"
        content={tender.orderobject}
        className="max-w-96"
        isDisabled={(tender.orderobject?.length || 0) < 180}
      >
        <motion.h1
          className="font-semibold w-2/3 mb-2"
          variants={h1Variants}
          initial="expanded"
          animate={isHeaderCollapsed ? "collapsed" : "expanded"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {truncate(tender.orderobject!, { length: 150 })}
        </motion.h1>
      </Tooltip>

      <AnimatePresence>
        {!isHeaderCollapsed && (
          <motion.div
            className="space-y-4"
            initial={
              hasRendered
                ? { opacity: 0, height: 0 }
                : { opacity: 1, height: "auto" }
            }
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <House className="w-4 h-4" />
                {tender.organizationname}
              </span>
              <span className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                {relativeToNow(new Date(tender.submittingoffersdate!))}
              </span>
            </div>
            <HeaderButtons
              {...props}
              commentCount={count}
              restoreTender={restoreTender}
              onUnseen={onUnseen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isHeaderCollapsed && (
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <House className="w-3 h-3" />
              {tender.organizationname}
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock className="w-3 h-3" />
              {relativeToNow(new Date(tender.submittingoffersdate!))}
            </span>
          </div>

          <HeaderButtons
            {...props}
            commentCount={count}
            restoreTender={restoreTender}
            size="sm"
            onUnseen={onUnseen}
          />
        </motion.div>
      )}
    </div>
  );
}
