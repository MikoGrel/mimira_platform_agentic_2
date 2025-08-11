"use client";

import { useMemo, Children } from "react";
import { cn } from "$/lib/utils";

type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface MasonryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The content to be displayed in the masonry layout */
  children: React.ReactNode;
  /** Responsive column configuration for different breakpoints */
  columns?: Partial<Record<Breakpoint, number>>;
  /** Gap between columns and rows */
  columnGap?: string;
  /** Additional CSS classes for individual items */
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

/**
 * A responsive masonry layout component that arranges items in columns
 * without reflowing when item heights change.
 *
 * @example
 * ```tsx
 * <Masonry columns={{ base: 1, md: 2, lg: 3 }}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Masonry>
 * ```
 *
 * @param props - The component props
 * @param props.children - Content to display in masonry layout
 * @param props.columns - Responsive column configuration
 * @param props.columnGap - Gap between columns and rows
 * @param props.itemClassName - Additional CSS classes for items
 * @param props.className - Additional CSS classes for container
 * @param props.style - Additional inline styles for container
 * @returns A responsive masonry layout
 */
export function Masonry({
  children,
  className,
  columns = { base: 1, md: 2 },
  columnGap = "1rem",
  itemClassName,
  style,
  ...props
}: MasonryProps) {
  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  // Get current column count based on viewport width
  const columnCount = useMemo(() => {
    if (typeof window === "undefined") return 1;

    const resolved = { base: 1, ...(columns ?? {}) } as Record<
      Breakpoint,
      number
    >;
    let active = resolved.base ?? 1;

    Object.entries(BREAKPOINT_PX).forEach(([bp, px]) => {
      if (bp !== "base" && window.innerWidth >= px) {
        const value = resolved[bp as Breakpoint];
        if (typeof value === "number") {
          active = value;
        }
      }
    });

    return Math.max(1, active);
  }, [columns]);

  // Simple round-robin distribution - items stay in their assigned column
  const distribution = useMemo(() => {
    const cols: number[][] = Array.from({ length: columnCount }, () => []);
    childrenArray.forEach((_, i) => {
      cols[i % columnCount].push(i);
    });
    return cols;
  }, [childrenArray, columnCount]);

  return (
    <div
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
            <div
              key={childIndex}
              className={cn("break-inside-avoid", itemClassName)}
            >
              {childrenArray[childIndex]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Masonry;
