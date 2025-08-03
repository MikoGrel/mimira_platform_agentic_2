"use client";

import { Button } from "@heroui/react";
import { Calendar, House } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Tables } from "$/types/supabase";

interface TenderHeaderProps {
  tender: Tables<"tenders">;
  isHeaderCollapsed: boolean;
}

export function TenderHeader({ tender, isHeaderCollapsed }: TenderHeaderProps) {
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
            initial={{ opacity: 0, height: 0 }}
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
            <div className="flex gap-3">
              <Button color="primary" data-lingo-override-pl="Aplikuj">
                Apply
              </Button>
              <Button variant="flat" color="danger">
                Reject
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
            <Button size="sm" color="primary" data-lingo-override-pl="Aplikuj">
              Apply
            </Button>
            <Button size="sm" variant="flat" color="danger">
              Reject
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
