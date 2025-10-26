import { InferSelectModel } from "drizzle-orm";
import { tasks as tasksTable } from "@/drizzle/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HydratedTask } from "@/lib/data/calendar/taskscalendar";

export default function Task({
  task,
  rowHeightPx,
}: {
  task: HydratedTask;
  rowHeightPx: number;
}) {
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
    <div
      className="absolute inset-y-0 flex items-center"
      style={{
        left: task.derived.left,
        height: `${ROW_HEIGHT_PX}px`,
        transform: "translateX(-50%)",
      }}
    >
      <Avatar
        className={`transition-all duration-200 ease-in-out cursor-pointer hover:scale-105 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]`}
        size="sm"
        style={{
          transformOrigin: "center center",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
        data-event="true"
      >
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
}
