import EventHeader from "./EventHeader";
import EventContent from "./EventContent";
import { Card, CardContent } from "@/components/ui/card";
import { finalEvent } from "@/lib/data/calendar/calendar";
import { Suspense } from "react";
import Link from "next/link";
import React from "react";
interface EventProps {
  event: finalEvent;
  rowHeightPx?: number;
}

export default function Event({ event, rowHeightPx = 96 }: EventProps) {
  // const { hasOverdueChecks, isLoading: isOverdueChecksLoading } =
  //   useEventOverduePanoptoChecks(event);
  // const hasOverduePanoptoChecks = hasOverdueChecks;
  // // Determine if we should show the overdue blinking effect
  // const shouldBlink = hasOverduePanoptoChecks;

  // Calculate width clamping
  const MAX_VISIBLE_WIDTH_PX = 500;
  const realWidthPx = parseFloat(event.derived.width);
  const isClamped = realWidthPx > MAX_VISIBLE_WIDTH_PX;
  const displayWidth = isClamped
    ? `${MAX_VISIBLE_WIDTH_PX}px`
    : event.derived.width;
  const continuationWidth = isClamped
    ? Math.max(0, realWidthPx - MAX_VISIBLE_WIDTH_PX)
    : 0;
  const maxVisibleWidthPx = MAX_VISIBLE_WIDTH_PX;

  // Calculate event height and positioning relative to row height
  const ROW_HEIGHT_PX = rowHeightPx;
  const DEFAULT_EVENT_HEIGHT_PX = Math.max(ROW_HEIGHT_PX - 8, 32); // default: slight vertical padding
  const REDUCED_EVENT_HEIGHT_PX = Math.max(
    Math.round(ROW_HEIGHT_PX * 0.67),
    32
  );
  const AD_HOC_EVENT_HEIGHT_PX = Math.max(Math.round(ROW_HEIGHT_PX * 0.5), 28);
  const MERGED_ROOM_HEIGHT_PX = Math.round(ROW_HEIGHT_PX * 1.875);

  let eventHeightPx: number;
  let eventTopPx: string;

  if (event.derived.isMergedRoomEvent) {
    eventHeightPx = MERGED_ROOM_HEIGHT_PX;
    eventTopPx = "6px";
  } else {
    // Default values for non-merged room events
    eventHeightPx = DEFAULT_EVENT_HEIGHT_PX;
    eventTopPx = "4px";
  }

  return (
    <Link href={`/calendar/${event.id}`}>
      <Card
        className={`absolute transition-all duration-200 ease-in-out cursor-pointer group rounded-md hover:scale-105 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${
          event.eventType === "Lecture" ? "text-white" : "text-gray-900"
        } text-sm ${event.derived.isShortLecture ? "px-1" : "px-2"} ${
          event.derived.isMergedRoomEvent ? "pt-2 pb-2" : "pt-5 pb-1"
        } ${
          event.derived.isMergedRoomEvent
            ? "hover:z-[70] z-[52]"
            : "hover:z-[60] z-[49]"
        }`}
        style={{
          top: eventTopPx,
          left: event.derived.left,
          width: displayWidth,
          height: `${eventHeightPx}px`,
          minHeight: `${eventHeightPx}px`,
          overflow: "visible",
          textOverflow: "ellipsis",
          whiteSpace: event.eventType === "Lecture" ? "nowrap" : "normal",
          transformOrigin: "center center",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          transition:
            "left 200ms ease-in-out, width 200ms ease-in-out, transform 200ms ease-in-out, box-shadow 200ms ease-in-out, z-index 200ms ease-in-out",
          ...(event.eventType === "Lecture" && {
            background: `
              radial-gradient(ellipse 150% 100% at center, #9a8bb8 0%, #9a8bb8 5%, #8a7ba9 20%, #7a6b9a 40%, #6a5a8a 60%, #5a4a7a 100%),
              radial-gradient(ellipse 200% 200% at center, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.4) 100%)
            `,
          }),
        }}
        title={event.eventName || ""}
        data-event="true"
      >
        <CardContent className="flex flex-col h-full p-0">
          <Suspense >
            <EventHeader event={event} />
          </Suspense>
          <div className="flex-1">
            <EventContent event={event} />
          </div>
          {/* Red blinking vignette border for events with overdue Panopto checks */}
          {/* {shouldBlink && (
            <div
              className="absolute inset-0 rounded-sm pointer-events-none"
              style={{
                animation: "blink-red-vignette 6s ease-in-out infinite",
              }}
            />
          )} */}
        </CardContent>
        {isClamped && continuationWidth > 0 && (
          <div
            aria-hidden
            className={`absolute pointer-events-none ${
              event.eventType === "KEC" ? "kec-continuation-line" : ""
            }`}
            style={{
              left: `${maxVisibleWidthPx}px`,
              top: "50%",
              transform: "translateY(-50%)",
              width: `${continuationWidth}px`,
              height: "2px",
              zIndex: -1,
            }}
          />
        )}
        {isClamped && continuationWidth > 0 && (
          <div
            aria-hidden
            className={`absolute pointer-events-none ${
              event.eventType === "KEC" ? "kec-continuation-line" : ""
            }`}
            style={{
              left: `${maxVisibleWidthPx + continuationWidth}px`,
              top: 0,
              width: "2px",
              height: "100%",
              zIndex: -1,
            }}
          />
        )}
      </Card>
    </Link>
  );
}
