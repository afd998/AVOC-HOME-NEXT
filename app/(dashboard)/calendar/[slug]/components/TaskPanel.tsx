import Link from "next/link";
import { TaskIcon } from "@/core/task/taskIcon";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";

type TaskPanelProps = {
  taskGroups: { roomName: string; tasks: HydratedTask[] }[];
};

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

function formatTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return timeFormatter.format(date);
}

export default function TaskPanel({ taskGroups }: TaskPanelProps) {
  const totalTasks = taskGroups.reduce(
    (count, group) => count + group.tasks.length,
    0
  );

  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-4 py-3">
        <h2 className="text-base font-semibold leading-none">Task View</h2>
        <p className="text-xs text-muted-foreground">
          Review upcoming tasks alongside the calendar.
        </p>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {totalTasks === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
            No tasks scheduled for this date.
          </p>
        ) : (
          <div className="space-y-4">
            {taskGroups.map((group) => (
              <section key={group.roomName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.roomName}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {group.tasks.length}{" "}
                    {group.tasks.length === 1 ? "task" : "tasks"}
                  </span>
                </div>
                <ul className="space-y-2">
                  {group.tasks.map((task) => {
                    const title = task.taskType?.trim() || "Task";
                    const subtitleParts = [
                      formatTime(task.startTime),
                      task.resource?.trim(),
                      task.status?.trim(),
                    ].filter(Boolean);
                    const subtitle = subtitleParts.join(" • ");

                    return (
                      <li key={task.id}>
                        <Link
                          href={`/tasks/${task.id}`}
                          className="group flex items-start gap-3 rounded-md border bg-muted/40 px-3 py-2 transition-colors hover:bg-muted"
                        >
                          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
                            <TaskIcon
                              task={task}
                              className="size-full p-1 text-muted-foreground"
                            />
                          </span>
                          <div className="flex flex-1 flex-col">
                            <span className="text-sm font-medium leading-tight">
                              {title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {subtitle || "No additional details"}
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
