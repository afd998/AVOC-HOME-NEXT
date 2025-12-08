import Link from "next/link";
import { formatTime } from "@/app/utils/dateTime";
import { Badge } from "@/components/ui/badge";

export type EventListItem = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  room: string | null;
  meetingLink?: string | null;
};

type EventListProps = {
  events: EventListItem[];
  emptyMessage?: string;
  badgeLabel?: string;
};

export function EventList({
  events,
  emptyMessage = "No events scheduled.",
  badgeLabel = "Hybrid",
}: EventListProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-md border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y rounded-md border">
      {events.map((event) => {
        const timeRange = [event.startTime, event.endTime]
          .filter(Boolean)
          .map((value) => formatTime(value))
          .join(" – ");

        const link = event.meetingLink?.trim() || null;
        const roomLabel = event.room?.trim() || null;
        const eventPath = `/events/${event.id}`;

        return (
          <Link
            key={event.id}
            href={eventPath}
            className="flex flex-col gap-2 px-4 py-3 transition hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="text-sm font-semibold leading-tight">{event.title}</div>
              <div className="text-xs text-muted-foreground">
                {timeRange || "Time TBD"}
                {roomLabel ? ` · ${roomLabel}` : ""}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {badgeLabel && (
                <Badge variant="secondary" className="text-[11px]">
                  {badgeLabel}
                </Badge>
              )}
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Join link
                </a>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
