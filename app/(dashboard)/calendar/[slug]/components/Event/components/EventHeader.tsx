import UserAvatar from "@/core/User/UserAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { finalEvent } from "@/lib/data/calendar/calendar";
import { useCallback } from "react";
import React from "react";
import { getEventData } from "@/lib/data/calendar/event/events";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default  async function EventHeader({ event }: { event: finalEvent }) {
  "use cashe"
  cacheTag(`event-header:${event.id}`)
  const eventData = await getEventData(event)
  const { owners, handOffTimes, timeline } = eventData;
  // Format start and end times from HH:MM:SS format (memoized)
  const formatTimeFromISO = useCallback((timeString: string | null) => {
    if (!timeString) return "";
    try {
      // Parse HH:MM:SS format
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      // If minutes are 00, show just the hour
      if (minutes === 0) {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        });
      } else {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch (error) {
      console.error("Error formatting time:", timeString, error);
      return "";
    }
  }, []);
  // Memoize the time display calculation
  const timeDisplay = `${formatTimeFromISO(
    event.startTime
  )} - ${formatTimeFromISO(event.endTime)}`;

  return (
    <div
      className={`flex  text-foreground justify-between items-center h-5 py-0.5 transition-all duration-200 ease-in-out absolute top-0 left-1 right-0 z-100`}
    >
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <span
          className={`text-xs font-medium opacity-90 truncate transition-all duration-200 ease-in-out ${
            event.eventType === "Ad Hoc Class Meeting"
              ? "text-gray-600"
              : event.eventType === "Lecture"
              ? "text-black"
              : "text-foreground"
          }`}
          title={timeDisplay}
        >
          {timeDisplay}
        </span>
      </div>
      {/* Only show the container if there are resources or assignees */}
      {(event.isFirstSession ||
        event.resources.length > 0 ||
        timeline.length > 0) && (
        <div
          className={`flex items-center gap-1 shrink-0 transition-all duration-200 ease-in-out overflow-visible bg-black/25  rounded-md px-2 py-1 mt-2`}
        >
          {event.isFirstSession && (
            <span
              className="text-yellow-500 dark:text-yellow-400 text-xs font-bold transition-all duration-250 ease-in-out cursor-pointer relative"
              title="First Session"
            >
              !
            </span>
          )}
          {event.resources
            .filter((resource) => resource.isAVResource)
            .filter(
              (resource) =>
                resource.itemName !== "KSM-KGH-AV-Lapel Microphone" &&
                resource.itemName !== "KSM-KGH-AV-Display Adapter" &&
                resource.itemName !== "KSM-KGH-AV-Presentation Clicker"
            )
            .map((resource, index) => (
              <Tooltip key={`resource-${index}`}>
                <TooltipTrigger asChild>
                  <div className="transition-all duration-250 ease-in-out cursor-pointer relative">
                    <div className="relative">
                      {resource.icon as React.ReactNode}
                      {/* {resource.displayName === "Video Recording" &&
                        allChecksComplete && (
                          <div classNam   e="absolute top-0 right-0">
                            <svg
                              className="text-green-400"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              viewBox="0 0 20 20"
                              style={{
                                width: "8px",
                                height: "8px",
                              }}
                            >
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                          </div>
                        )} */}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {/* {resource.displayName === "Video Recording" &&
                    allChecksComplete
                      ? "Video Recording - All Checks Complete"
                      : resource.displayName} */}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}

          {/* Separator bar between resource icons and owner icons */}
          {(event.isFirstSession || event.resources.length > 0) &&
            timeline.length > 0 && (
              <div className="w-0.5 h-4 bg-white dark:bg-gray-800 mx-0.5 opacity-20"></div>
            )}

          {/* Owner Avatars */}
          {timeline.length > 0 && (
            <div className="flex items-center gap-0.5">
              {timeline.map((entry, index) => (
                <React.Fragment key={entry.ownerId}>
                  {/* Owner Avatar */}
                  <div
                    className="transition-all duration-200 ease-in-out"
                    title={`Assigned to: ${entry.ownerId}`}
                  >
                    <UserAvatar userId={entry.ownerId} size="xs" />
                  </div>

                  {/* Arrow (if not the last owner) */}
                  {index < timeline.length - 1 && (
                    <svg
                      className="w-3 h-3 text-white transition-all duration-200 ease-in-out"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
