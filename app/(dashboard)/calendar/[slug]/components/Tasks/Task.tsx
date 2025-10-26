import { InferSelectModel } from "drizzle-orm";
import { tasks as tasksTable } from "@/drizzle/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
type TaskRow = InferSelectModel<typeof tasksTable>;
export default function Task({
  task,
  rowHeightPx,
}: {
  task: TaskRow;
  rowHeightPx: number;
}) {
 console.log(task);
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

  return (
    <Avatar
      className={`absolute transition-all duration-200 ease-in-out cursor-pointer group rounded-md hover:scale-105 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]
     
     `}
      style={{
        top: eventTopPx,
        left: event.derived.left,
        height: `${eventHeightPx}px`,
        minHeight: `${eventHeightPx}px`,
        overflow: "visible",
        textOverflow: "ellipsis",
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
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}
