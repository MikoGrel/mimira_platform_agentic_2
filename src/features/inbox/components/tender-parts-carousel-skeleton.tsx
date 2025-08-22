"use client";

import { Card, CardBody, CardHeader, Skeleton } from "@heroui/react";
import { cn } from "$/lib/utils";
import { motion } from "motion/react";

interface TenderPartsCarouselSkeletonProps {
  isCollapsed?: boolean;
  partsCount?: number;
}

export function TenderPartsCarouselSkeleton({
  isCollapsed = false,
  partsCount = 3,
}: TenderPartsCarouselSkeletonProps) {
  return (
    <div className="border-b sticky top-0 z-30 bg-background">
      <div
        className={cn(
          "grid grid-cols-1 gap-0 px-6",
          isCollapsed ? "py-2" : "py-4",
          isCollapsed ? "relative" : ""
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>
        )}

        {isCollapsed && (
          <>
            <Skeleton className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded z-10" />
            <Skeleton className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded z-10" />
          </>
        )}

        <div className="min-w-0">
          <div className="overflow-hidden">
            <div className="flex gap-3 py-2 pl-0.5 pr-0.5">
              {Array.from({ length: partsCount }).map((_, index) => (
                <div key={index} className="flex-[0_0_240px]">
                  <Card shadow="sm" className="h-full w-full">
                    <CardHeader className="pb-1 px-3 pt-3 flex flex-col gap-1">
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardBody className="pt-0 px-3 pb-3">
                      <motion.div
                        className="overflow-hidden"
                        animate={{
                          height: isCollapsed ? "0px" : "auto",
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-8" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-8" />
                          </div>
                        </div>
                      </motion.div>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
