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
import { useCommentsCount } from "$/features/tenders/api/use-comments-count";
import { useRestoreRejectedTender } from "../api/use-restore-rejected-tender";
import { truncate } from "lodash-es";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { useUnseen } from "../api/use-unseen";
import { toast } from "sonner";
import { InboxTenderPart } from "../api/use-tender-inbox-query";
import { IndividualTenderMapping } from "$/features/tenders/api/use-individual-tender";

interface TenderHeaderProps {
  mapping: IndividualTenderMapping;
  isHeaderCollapsed: boolean;
  setCommentsOpened: (value: boolean) => void;
  onApprovePart?: () => void;
  approvedPartIds: Set<string>;
  currentPart?: {
    item: InboxTenderPart | null;
    isApproved: boolean;
  };
  onUnselectAll?: () => void;
  onRemoveCurrentPart?: () => void;
  onApply: (partIds?: string[]) => void;
  onReject?: () => void;
  hasMultipleParts: boolean;
}

interface HeaderButtonsProps {
  size?: "sm";
  mapping: IndividualTenderMapping;
  approvedPartIds: Set<string>;
  currentPart?: {
    item: InboxTenderPart | null;
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
  hasMultipleParts: boolean;
}

function HeaderButtons({
  mapping,
  size,
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
  hasMultipleParts,
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
          onPress={() => restoreTender(mapping.id)}
        >
          Restore
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {hasMultipleParts ? (
        <>
          {hasNoSelection && (
            <>
              <Button
                size={size}
                onPress={() => onApply()}
                color="primary"
                data-lingo-override-pl="Aplikuj"
              >
                Apply
              </Button>
              <Button onPress={() => onReject?.()} size={size} variant="flat">
                Reject
              </Button>
            </>
          )}

          {hasCurrentPart && (
            <>
              {isCurrentPartApproved ? (
                <Button
                  size={size}
                  color="danger"
                  variant="flat"
                  onPress={onRemoveCurrentPart}
                >
                  Unselect
                </Button>
              ) : (
                <Button
                  size={size}
                  color="primary"
                  variant="flat"
                  onPress={onApprovePart}
                >
                  Approve this part
                </Button>
              )}
            </>
          )}

          {hasApprovedParts && (
            <>
              <Button
                size={size}
                variant="flat"
                color="primary"
                onPress={() => onApply(Array.from(approvedPartIds))}
                data-lingo-override-pl="Aplikuj na wybrane części"
              >
                Apply to selected parts
              </Button>

              <Button
                size={size}
                variant="flat"
                onPress={() => onApply()}
                data-lingo-override-pl="Aplikuj na cały przetarg"
              >
                Apply to full tender
              </Button>

              <Button size={size} variant="flat" onPress={onUnselectAll}>
                Unselect all
              </Button>
            </>
          )}
        </>
      ) : (
        // Single part or no parts - show only apply/reject buttons
        <>
          <Button
            size={size}
            onPress={() => onApply()}
            color="primary"
            data-lingo-override-pl="Aplikuj"
          >
            Apply
          </Button>
          <Button onPress={() => onReject?.()} size={size} variant="flat">
            Reject
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
              onUnseen(mapping.id);
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
  const { mapping, isHeaderCollapsed } = props;
  const [hasRendered, setHasRendered] = useState(false);
  const { count } = useCommentsCount({
    mappingId: mapping.id,
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
  const isRejected = mapping.status === "rejected";

  useEffect(() => {
    setHasRendered(true);
  }, []);

  const h1Variants = {
    collapsed: {
      fontSize: "16px",
      lineHeight: "20px",
    },
    expanded: {
      fontSize: "18px",
      lineHeight: "24px",
    },
  };

  return (
    <div className="border-b border-border bg-background overflow-hidden px-6 py-4">
      {isRejected && (
        <Chip color="danger" size="sm" className="mb-2" variant="flat">
          Rejected
        </Chip>
      )}

      <Tooltip
        placement="bottom-start"
        content={mapping.tenders?.order_object}
        className="max-w-96"
        isDisabled={(mapping.tenders?.order_object?.length || 0) < 180}
      >
        <motion.h1
          className="font-semibold w-2/3 mb-2"
          variants={h1Variants}
          initial="expanded"
          animate={isHeaderCollapsed ? "collapsed" : "expanded"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {truncate(mapping.tenders?.order_object || "", { length: 150 })}
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
                {truncate(mapping.tenders?.organization_name || "", {
                  length: 80,
                })}
              </span>
              {mapping.tenders.submitting_offers_date && (
                <span className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" />
                  {relativeToNow(
                    new Date(mapping.tenders.submitting_offers_date)
                  )}
                </span>
              )}
            </div>
            <HeaderButtons
              {...props}
              commentCount={count}
              restoreTender={restoreTender}
              onUnseen={onUnseen}
              hasMultipleParts={props.hasMultipleParts}
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
              {mapping.tenders?.organization_name}
            </span>
            {mapping.tenders.submitting_offers_date && (
              <span className="flex items-center gap-1">
                <CalendarClock className="w-3 h-3" />
                {relativeToNow(
                  new Date(mapping.tenders.submitting_offers_date)
                )}
              </span>
            )}
          </div>

          <HeaderButtons
            {...props}
            commentCount={count}
            restoreTender={restoreTender}
            size="sm"
            onUnseen={onUnseen}
            onApply={props.onApply}
            hasMultipleParts={props.hasMultipleParts}
          />
        </motion.div>
      )}
    </div>
  );
}
