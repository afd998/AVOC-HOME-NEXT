'use client';

import { useCallback, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import DraggableGridContainer from "@/app/(dashboard)/calendar/[slug]/components/DraggableGridContainer";

interface CalendarDragShellProps {
  children: ReactNode;
  startHour: number;
  endHour: number;
  pixelsPerMinute: number;
  actualRowCount: number;
  rowHeightPx?: number;
  pageZoom?: number;
  headerHeightPx?: number;
  className?: string;
  dataAutoHide?: "true";
  onScrollChange?: (position: { left: number; top: number }) => void;
  header?: ReactNode;
}

/**
 * Wraps server-rendered grid content with draggable scrolling and sizing while keeping the header in sync.
 */
export default function CalendarDragShell({
  children,
  startHour,
  endHour,
  pixelsPerMinute,
  actualRowCount,
  rowHeightPx = 96,
  pageZoom = 1,
  headerHeightPx = 24,
  className,
  dataAutoHide,
  onScrollChange,
  header,
}: CalendarDragShellProps) {
  const safeRowCount = Math.max(actualRowCount, 1);
  const totalMinutes = Math.max(1, (endHour - startHour) * 60);
  const contentWidth = totalMinutes * pixelsPerMinute;
  const contentHeight = safeRowCount * rowHeightPx;

  const [scrollPosition, setScrollPosition] = useState({
    left: 0,
    top: 0,
  });

  const handleScrollPositionChange = useCallback(
    (position: { left: number; top: number }) => {
      setScrollPosition(position);
      if (onScrollChange) {
        onScrollChange(position);
      }
    },
    [onScrollChange]
  );

  const stickyHeaderHeight = headerHeightPx * pageZoom;

  return (
    <div className="relative h-full w-full">
      {header ? (
        <div
          className="sticky top-[-10px] z-40 overflow-hidden"
          style={{ minHeight: headerHeightPx ? `${stickyHeaderHeight}px` : undefined }}
        >
          <div
            style={{
              width: `${contentWidth * pageZoom}px`,
              minHeight: headerHeightPx ? `${stickyHeaderHeight}px` : undefined,
              transform: `translateX(-${scrollPosition.left}px)`,
            }}
          >
            <div
              style={{
                transform: `scaleY(${pageZoom})`,
                transformOrigin: "top left",
                width: `${contentWidth * pageZoom}px`,
                minHeight: headerHeightPx ? `${headerHeightPx}px` : undefined,
              }}
            >
              {header}
            </div>
          </div>
        </div>
      ) : null}

      <DraggableGridContainer
        className={cn("relative w-full overflow-auto", className)}
        startHour={startHour}
        endHour={endHour}
        pixelsPerMinute={pixelsPerMinute}
        actualRowCount={safeRowCount}
        rowHeightPx={rowHeightPx}
        isDragEnabled
        pageZoom={pageZoom}
        onScrollPositionChange={handleScrollPositionChange}
      >
        <div
          className="relative"
          style={{
            width: `${contentWidth}px`,
            minHeight: `${contentHeight}px`,
          }}
          data-auto-hide={dataAutoHide}
        >
          {children}
        </div>
      </DraggableGridContainer>
    </div>
  );
}
