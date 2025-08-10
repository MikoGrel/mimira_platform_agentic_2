"use client";

import * as React from "react";
import { cn } from "$/lib/utils";
import { useMeasure } from "react-use";

type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface MasonryProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: Partial<Record<Breakpoint, number>>;
  columnGap?: string;
  itemClassName?: string;
}

const BREAKPOINT_PX: Record<Breakpoint, number> = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

function getActiveColumns(
  config: MasonryProps["columns"],
  viewportWidth: number
): number {
  const resolved = { base: 1, ...(config ?? {}) } as Record<Breakpoint, number>;
  let active = resolved.base ?? 1;
  (Object.keys(BREAKPOINT_PX) as Breakpoint[]).forEach((bp) => {
    const bpPx = BREAKPOINT_PX[bp];
    const value = resolved[bp];
    if (bp !== "base" && viewportWidth >= bpPx && typeof value === "number") {
      active = value;
    }
  });
  return Math.max(1, active);
}

export function Masonry({
  children,
  className,
  columns = { base: 1, md: 2 },
  columnGap = "1rem",
  itemClassName,
  style,
  ...props
}: MasonryProps) {
  const [containerRef, containerBounds] = useMeasure<HTMLDivElement>();
  const containerWidth = containerBounds.width ?? 0;
  const columnCount = React.useMemo(
    () => getActiveColumns(columns, containerWidth),
    [columns, containerWidth]
  );

  const childrenArray = React.useMemo(
    () => React.Children.toArray(children),
    [children]
  );

  const heightsRef = React.useRef<Map<number, number>>(new Map());
  const [distribution, setDistribution] = React.useState<number[][]>([]);
  const scheduledRef = React.useRef<number | null>(null);

  // Initial simple round-robin distribution for first paint
  React.useEffect(() => {
    const cols: number[][] = Array.from({ length: columnCount }, () => []);
    childrenArray.forEach((_, i) => {
      const col = i % columnCount;
      cols[col].push(i);
    });
    setDistribution(cols);
  }, [childrenArray, columnCount]);

  // Recompute balanced distribution when all heights known or on column change
  const recomputeBalanced = React.useCallback(() => {
    const numCols = columnCount;
    const cols: number[][] = Array.from({ length: numCols }, () => []);
    const colHeights = new Array<number>(numCols).fill(0);

    childrenArray.forEach((_, index) => {
      const height = heightsRef.current.get(index) ?? 0;
      let target = 0;
      let min = colHeights[0];
      for (let c = 1; c < numCols; c++) {
        if (colHeights[c] < min) {
          min = colHeights[c];
          target = c;
        }
      }
      cols[target].push(index);
      colHeights[target] += height;
    });
    setDistribution(cols);
  }, [childrenArray, columnCount]);

  // Schedule recompute once after measurements settle
  const scheduleRecompute = React.useCallback(() => {
    if (scheduledRef.current != null) return;
    scheduledRef.current = window.setTimeout(() => {
      scheduledRef.current = null;
      recomputeBalanced();
    }, 0);
  }, [recomputeBalanced]);

  // Recompute on column change if we already have measurements
  React.useEffect(() => {
    if (heightsRef.current.size > 0) {
      recomputeBalanced();
    }
  }, [recomputeBalanced]);

  const onItemSize = React.useCallback(
    (index: number, height: number) => {
      const prev = heightsRef.current.get(index);
      if (prev !== height) {
        heightsRef.current.set(index, height);
        scheduleRecompute();
      }
    },
    [scheduleRecompute]
  );

  return (
    <div
      ref={containerRef}
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        columnGap,
        rowGap: columnGap,
        ...style,
      }}
      {...props}
    >
      {distribution.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col" style={{ gap: columnGap }}>
          {col.map((childIndex) => (
            <MeasuredItem
              key={childIndex}
              index={childIndex}
              onSize={onItemSize}
              className={itemClassName}
            >
              {childrenArray[childIndex]}
            </MeasuredItem>
          ))}
        </div>
      ))}
    </div>
  );
}

function MeasuredItem({
  index,
  onSize,
  className,
  children,
}: {
  index: number;
  onSize: (index: number, height: number) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    onSize(index, el.offsetHeight);
    const ro = new ResizeObserver(() => {
      onSize(index, el.offsetHeight);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [index, onSize]);

  return (
    <div ref={ref} className={cn("break-inside-avoid", className)}>
      {children}
    </div>
  );
}

export default Masonry;
