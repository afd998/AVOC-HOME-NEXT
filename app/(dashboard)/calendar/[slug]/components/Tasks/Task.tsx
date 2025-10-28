import Link from "next/link";
import { Check } from "lucide-react";

import { HydratedTask } from "@/lib/data/calendar/taskscalendar";
import { TaskIcon } from "@/core/task/taskIcon";
import { cn } from "@/lib/utils";

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

  const normalizedStatus = task.status?.trim().toLowerCase();
  const isCompleted = normalizedStatus === "completed";

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="group"
    >
      <div
        className="absolute inset-y-0 flex items-center"
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
          <div className="relative flex items-center justify-center">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-muted/70 text-muted-foreground shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out group-hover:scale-105 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
                isCompleted &&
                  "border-emerald-400/70 bg-emerald-500/10 text-emerald-600 ring ring-emerald-500 ring-offset-1 ring-offset-background"
              )}
              data-event="true"
            >
              <TaskIcon
                task={task}
                className={cn(
                  "h-full w-full p-[3px]",
                  isCompleted ? "text-emerald-600" : "text-muted-foreground"
                )}
              />
            </span>
            {isCompleted ? (
              <span className="absolute -right-1 -bottom-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                <Check className="h-2.5 w-2.5" />
              </span>
            ) : null}
          </div>
          <span
            aria-hidden="true"
            className="h-2 w-px rounded-full bg-muted-foreground/60"
          />
        </div>
      </div>
    </Link>
  );
}
