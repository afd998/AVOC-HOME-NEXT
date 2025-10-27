import { HydratedTask } from "@/lib/data/calendar/taskscalendar";
import { TaskIcon } from "@/core/task/taskIcon";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
    <Link href={`/tasks/${task.id}`}>
      <div
        className="absolute inset-y-0 flex z-[100] items-center"
        style={{
          left: task.derived.left,
          height: `${ROW_HEIGHT_PX}px`,
          transform: "translateX(-50%)",
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <span
            aria-hidden="true"
            className="h-2 w-px rounded-full bg-muted-foreground/60"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={task.taskType}
            className="h-8 w-8 rounded-full p-1 bg-transparent shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
            style={{ transformOrigin: "center center" }}
            data-event="true"
          >
            <TaskIcon task={task} className="w-full h-full" />
          </Button>
          <span
            aria-hidden="true"
            className="h-2 w-px rounded-full bg-muted-foreground/60"
          />
        </div>
      </div>
    </Link>
  );
}
