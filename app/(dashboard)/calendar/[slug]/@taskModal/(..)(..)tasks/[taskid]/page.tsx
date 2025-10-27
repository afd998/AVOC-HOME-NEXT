import TaskDialogShell from "@/app/(dashboard)/calendar/[slug]/@taskModal/TaskDialogShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import Link from "next/link";
import { TaskIcon } from "@/core/task/taskIcon";
import { getTaskById } from "@/lib/data/tasks/task";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { ReactNode } from "react";

type TasksPageProps = {
  params: {
    slug: string;
    taskid: string;
  };
};

export default async function TasksPage({ params }: TasksPageProps) {
  const { taskid } = await params;
  return (
    <TaskDialogShell>
      <TaskDialogContent taskId={taskid} />
    </TaskDialogShell>
  );
}

type TaskDialogContentProps = {
  taskId: string;
};

async function TaskDialogContent({ taskId }: TaskDialogContentProps) {
  "use cache";
  cacheTag(`task:${taskId}`);
  
  const task = await getTaskById(taskId);
  if (!task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task not found</CardTitle>
          <CardDescription>
            We could not find a task for ID {taskId}. It may have been removed.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-end">
          <Link
            href="/tasks"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View all tasks
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const formattedDate = formatTaskDate(task.date);
  const formattedTime = formatTaskTime(task.startTime);
  const formattedStatus = formatNullable(task.status, "No status set");
  const createdAtLabel = formatDateTime(task.createdAt);
  const eventDetailText = task.eventDetails
    ? `${task.eventDetails.eventName} - ${formatTaskDate(task.eventDetails.date)} | ${formatTaskTime(task.eventDetails.startTime)} - ${formatTaskTime(task.eventDetails.endTime)}`
    : "No linked event";
  const resourceEvents = task.eventDetails?.resourceEvents ?? [];
  const taskResourceId =
    typeof task.resource === "string" && task.resource.trim().length > 0
      ? task.resource.trim()
      : null;
  const hasResourceEvents = resourceEvents.length > 0;

  const taskDetails: Array<{ label: string; value: ReactNode; href?: string }> = [
    { label: "Room", value: task.room },
    { label: "Status", value: formattedStatus },
    {
      label: "Event",
      value: eventDetailText,
      href: task.eventDetails ? `/events/${task.eventDetails.id}` : undefined,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-background">
            <TaskIcon task={task} className="h-12 w-12 p-3" />
          </span>
          <div className="flex flex-col gap-1">
            <CardTitle>{task.taskType}</CardTitle>
            <CardDescription>
              {formattedDate} | {formattedTime}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Task Details
          </h3>
          <ItemGroup className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            {taskDetails.map(({ label, value, href }) => {
              const content = (
                <ItemContent className="flex flex-col gap-1">
                  <ItemTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </ItemTitle>
                  <ItemDescription className="text-sm font-medium text-foreground">
                    {value}
                  </ItemDescription>
                </ItemContent>
              );

              if (href) {
                return (
                  <Item
                    key={label}
                    variant="outline"
                    size="sm"
                    className="flex-col items-start gap-3"
                    asChild
                  >
                    <Link
                      href={href}
                      className="flex w-full flex-col gap-3 rounded-md no-underline"
                    >
                      {content}
                    </Link>
                  </Item>
                );
              }

              return (
                <Item
                  key={label}
                  variant="outline"
                  size="sm"
                  className="flex-col items-start gap-3"
                >
                  {content}
                </Item>
              );
            })}
          </ItemGroup>
        </section>
        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Resource Details
          </h3>
          {hasResourceEvents ? (
            <ItemGroup className="flex flex-col gap-3">
              {resourceEvents.map((resourceEvent) => {
                const resourceName =
                  resourceEvent.resourcesDict?.name &&
                  resourceEvent.resourcesDict.name.trim().length > 0
                    ? resourceEvent.resourcesDict.name
                    : resourceEvent.resourceId;
                const instructionsRaw = resourceEvent.instructions ?? "";
                const instructionsHasText =
                  instructionsRaw.trim().length > 0;
                const instructions = instructionsHasText
                  ? instructionsRaw.trim()
                  : "No instructions provided";

                return (
                  <Item
                    key={`${resourceEvent.resourceId}-${resourceEvent.eventId}`}
                    variant="outline"
                    size="sm"
                    className="flex w-full flex-col items-start gap-3"
                  >
                    <ItemContent className="flex w-full flex-col gap-3">
                      <ItemTitle className="text-base font-semibold text-foreground">
                        {resourceName}
                      </ItemTitle>
                      <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold uppercase tracking-wide">
                            Resource ID
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {resourceEvent.resourceId}
                          </span>
                    </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold uppercase tracking-wide">
                            Quantity
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {resourceEvent.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Instructions
                        </span>
                        <p
                          className={`text-sm whitespace-pre-wrap ${
                            instructionsHasText
                              ? "text-foreground"
                              : "text-muted-foreground italic"
                          }`}
                        >
                          {instructions}
                        </p>
                      </div>
                    </ItemContent>
                  </Item>
                );
              })}
            </ItemGroup>
          ) : taskResourceId ? (
            <ItemGroup className="flex flex-col gap-3">
              <Item
                variant="outline"
                size="sm"
                className="flex w-full flex-col items-start gap-3"
              >
                <ItemContent className="flex w-full flex-col gap-2">
                  <ItemTitle className="text-base font-semibold text-foreground">
                    {taskResourceId}
                  </ItemTitle>
                  <ItemDescription className="text-sm text-muted-foreground">
                    This task references resource ID {taskResourceId}, but no linked event resource details were found.
                  </ItemDescription>
                </ItemContent>
              </Item>
            </ItemGroup>
          ) : (
            <p className="text-sm text-muted-foreground">
              No resources linked to this task.
            </p>
          )}
        </section>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:text-sm">
        <div>
          <span className="font-medium text-foreground">Task ID:</span>{" "}
          {task.id}
        </div>
        <div>
          <span className="font-medium text-foreground">Created:</span>{" "}
          {createdAtLabel}
        </div>
        <Link
          href={`/tasks/${task.id}`}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Open full task
        </Link>
      </CardFooter>
    </Card>
  );
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "full",
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatTaskDate(value: string) {
  if (!value) {
    return "No date";
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateFormatter.format(date);
}

function formatTaskTime(value: string | null | undefined) {
  if (!value) {
    return "No start time";
  }
  const [hour, minute] = value.split(":");
  const parsedHour = Number(hour);
  const parsedMinute = Number(minute);
  if (Number.isNaN(parsedHour) || Number.isNaN(parsedMinute)) {
    return value;
  }
  const date = new Date();
  date.setHours(parsedHour, parsedMinute, 0, 0);
  return timeFormatter.format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Unknown";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateTimeFormatter.format(date);
}

function formatNullable(value: string | null | undefined, fallback: string) {
  if (value == null) {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}
