"use client";

import { Button } from "@heroui/react";
import { Calendar, House, MessageSquareText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Tables } from "$/types/supabase";
import { useCommentsCount } from "$/features/tenders/api/use-comments-count";

interface TenderHeaderProps {
  tender: Tables<"tenders">;
  isHeaderCollapsed: boolean;
  setCommentsOpened: (value: boolean) => void;
  onSavePart?: () => void;
  onFinishApply?: () => void;
  canSavePart?: boolean;
  canFinishApply?: boolean;
  usePartActions?: boolean;
  hasAnySavedParts?: boolean;
  currentPartIsSaved?: boolean;
  isOverviewSelected?: boolean;
  hasParts?: boolean;
  onUnselectAll?: () => void;
  onRemoveCurrentPart?: () => void;
  onApplySavedParts?: () => void;
  onReject?: () => void;
}

export function TenderHeader({
  tender,
  isHeaderCollapsed,
  setCommentsOpened,
  onSavePart,
  canSavePart = true,
  hasAnySavedParts = false,
  currentPartIsSaved = false,
  isOverviewSelected = false,
  hasParts = true,
  onUnselectAll,
  onRemoveCurrentPart,
  onApplySavedParts,
  onReject,
}: TenderHeaderProps) {
  const [hasRendered, setHasRendered] = useState(false);
  const { count } = useCommentsCount({
    tenderId: tender.id,
  });

  useEffect(() => {
    setHasRendered(true);
  }, []);

  return (
    <div className="border-b border-gray-200 bg-white overflow-hidden px-6 py-4">
      <motion.h1
        className="font-semibold text-gray-900 w-2/3"
        animate={{
          fontSize: isHeaderCollapsed ? "14px" : "18px",
          lineHeight: isHeaderCollapsed ? "20px" : "28px",
          marginBottom: isHeaderCollapsed ? "4px" : "0px",
        }}
        transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
        initial={{
          fontSize: "18px",
          lineHeight: "28px",
          marginBottom: "0px",
        }}
      >
        {tender.orderobject}
      </motion.h1>

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
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <House className="w-4 h-4" />
                {tender.organizationname}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {tender.submittingoffersdate}
              </span>
            </div>
            <div className="flex gap-2">
              {(!hasParts || isOverviewSelected) && (
                <>
                  <Button color="primary" data-lingo-override-pl="Aplikuj">
                    Apply
                  </Button>
                  <Button variant="flat" onPress={onReject}>
                    Reject
                  </Button>
                  {hasAnySavedParts && (
                    <Button
                      variant="flat"
                      onPress={onApplySavedParts}
                      data-lingo-override-pl="Aplikuj na wybrane części"
                    >
                      Apply to saved parts
                    </Button>
                  )}
                  {hasAnySavedParts && (
                    <Button variant="flat" onPress={onUnselectAll}>
                      Unselect all
                    </Button>
                  )}
                </>
              )}

              {hasParts && !isOverviewSelected && (
                <>
                  {currentPartIsSaved ? (
                    <Button color="primary" onPress={onRemoveCurrentPart}>
                      Remove
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      onPress={onSavePart}
                      isDisabled={!canSavePart}
                    >
                      Save
                    </Button>
                  )}
                  {hasAnySavedParts && (
                    <Button variant="flat" onPress={onApplySavedParts}>
                      Apply to saved parts
                    </Button>
                  )}
                  {hasAnySavedParts && (
                    <Button variant="flat" onPress={onUnselectAll}>
                      Unselect all
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                onPress={() => setCommentsOpened(true)}
                className="!min-w-10"
                isIconOnly={!count}
              >
                <MessageSquareText className="w-5 h-5 stroke-[1.5]" />
                {!!count && count}
              </Button>
            </div>
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
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <House className="w-3 h-3" />
              {tender.organizationname}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {tender.submittingoffersdate}
            </span>
          </div>
          <div className="flex gap-2">
            {(!hasParts || isOverviewSelected) && (
              <>
                <Button
                  size="sm"
                  color="primary"
                  data-lingo-override-pl="Aplikuj"
                >
                  Apply
                </Button>
                <Button size="sm" variant="flat" onPress={onReject}>
                  Reject
                </Button>
                {hasAnySavedParts && (
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={onApplySavedParts}
                    data-lingo-override-pl="Aplikuj na wybrane części"
                  >
                    Apply to saved parts
                  </Button>
                )}
                {hasAnySavedParts && (
                  <Button size="sm" variant="flat" onPress={onUnselectAll}>
                    Unselect all
                  </Button>
                )}
              </>
            )}

            {hasParts && !isOverviewSelected && (
              <>
                {currentPartIsSaved ? (
                  <Button
                    size="sm"
                    color="primary"
                    onPress={onRemoveCurrentPart}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    color="primary"
                    onPress={onSavePart}
                    isDisabled={!canSavePart}
                  >
                    Save
                  </Button>
                )}
                {hasAnySavedParts && (
                  <Button size="sm" variant="flat" onPress={onApplySavedParts}>
                    Apply to saved parts
                  </Button>
                )}
                {hasAnySavedParts && (
                  <Button size="sm" variant="flat" onPress={onUnselectAll}>
                    Unselect all
                  </Button>
                )}
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onPress={() => setCommentsOpened(true)}
              className="!min-w-10"
              isIconOnly={!count}
            >
              <MessageSquareText className="w-5 h-5 stroke-[1.5]" />
              {!!count && count}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
