import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { finalEvent } from "@/lib/data/calendar/calendar";
import { RecordingIcon, ZoomIcon } from "@/core/event/event-configuration/icons";
export default function EventHeader({ event }: { event: finalEvent }) {
  // Simple time formatting
  const formatTime = (time: string | null) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return minutes === 0
      ? `${displayHour} ${period}`
      : `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const timeDisplay = `${formatTime(event.startTime)} - ${formatTime(
    event.endTime
  )}`;

  const hasHybrid = Boolean(event.hybrid);
  const hasRecording = Boolean(event.recording);
  const showIcons = hasHybrid || hasRecording;

  return (
    <div
      className={`flex  text-foreground justify-between items-center h-5 py-0.5 transition-all duration-200 ease-in-out absolute top-0 left-1 right-0 z-100`}
    >
      <div className="flex items-center gap-1 min-w-0 flex-1">
        {/* <span
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
        </span> */}
      </div>
      {showIcons && (
        <div className="flex items-center gap-1 shrink-0 transition-all duration-200 ease-in-out">
          {hasHybrid && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center rounded-sm p-1">
                  <ZoomIcon />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hybrid (Zoom)</p>
              </TooltipContent>
            </Tooltip>
          )}
          {hasRecording && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center rounded-sm p-1">
                  <RecordingIcon />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Recording scheduled</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}
