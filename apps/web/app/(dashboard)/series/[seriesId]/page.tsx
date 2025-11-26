import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventsBySeries } from "@/lib/data/calendar/event/events";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import {
  formatDate,
  formatTimeFromHHMMSS,
} from "@/lib/utils/timeUtils";
import EventConfiguration from "@/core/event/EventDetails/EventConfiguration";
import { FacultyItem } from "@/core/faculty/FacultyItem";

type SeriesPageProps = {
  params: Promise<{ seriesId: string }>;
};

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { seriesId } = await params;
  const events = await getEventsBySeries(seriesId);

  if (!events || events.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <header className="flex-shrink-0 border-b border-border bg-background px-4 py-6">
          <div className="container mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Series
            </p>
            <h1 className="text-2xl font-semibold leading-snug sm:text-3xl">
              Series Not Found
            </h1>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-3xl border border-dashed border-border bg-background px-6 py-10 text-center text-muted-foreground">
            No events found in this series
          </div>
        </div>
      </div>
    );
  }

  const firstEvent = events[0];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex-shrink-0 border-b border-border bg-background px-4 py-6">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Series
              </p>
              <h1 className="text-2xl font-semibold leading-snug sm:text-3xl">
                {firstEvent.eventName}
              </h1>
            </div>
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            >
              {firstEvent.eventType || "Uncategorized"}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {events.length} {events.length === 1 ? "event" : "events"}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            {events.map((event, index) => (
              <SeriesEventCard
                key={event.id}
                event={event}
                index={index}
                total={events.length}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SeriesEventCardProps {
  event: finalEvent;
  index: number;
  total: number;
}

function SeriesEventCard({ event, index, total }: SeriesEventCardProps) {
  const dateLabel = formatDate(event.date);
  const startLabel = formatTimeFromHHMMSS(event.startTime);
  const endLabel = formatTimeFromHHMMSS(event.endTime);
  
  // Get day of the week - parse date string as local time to avoid timezone issues
  const dayOfWeek = event.date 
    ? (() => {
        // Parse YYYY-MM-DD as local date to avoid UTC interpretation
        const [year, month, day] = event.date.split("-").map(Number);
        const localDate = new Date(year, month - 1, day);
        return localDate.toLocaleDateString("en-US", { weekday: "short" });
      })()
    : "";

  return (
    <Card className="group relative transition-all duration-300 ease-out">
      <Link href={`/events/${event.id}`} className="no-underline">
        <CardHeader className="px-5 py-4 cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-base font-semibold">
                {dayOfWeek ? `${dayOfWeek}, ` : ""}{dateLabel}
                {startLabel ? ` | ${startLabel}` : ""}
                {endLabel ? ` - ${endLabel}` : ""}
              </CardTitle>
              <CardMeta
                label="Room"
                value={event.roomName || "Unknown room"}
              />
              {event.faculty && event.faculty.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Instructors:</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {event.faculty.map((member) => (
                      <FacultyItem
                        key={member.id}
                        faculty={member}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              ) : event.instructorNames && Array.isArray(event.instructorNames) && event.instructorNames.length > 0 ? (
                <CardMeta
                  label="Instructors"
                  value={formatInstructorSummary(event.instructorNames)}
                />
              ) : null}
              {event.section && (
                <CardMeta label="Section" value={event.section} />
              )}
            </div>
            <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
              <span>
                {index + 1} of {total}
              </span>
            </div>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="px-5 pb-5 pt-0">
        <EventConfiguration
          event={event}
          roomName={event.roomName || "Unknown room"}
          showHybrid={true}
          showRecording={true}
          showAvConfig={true}
          showOtherHardware={true}
        />
      </CardContent>
    </Card>
  );
}

function CardMeta({ label, value }: { label: string; value: string }) {
  if (!value) {
    return null;
  }

  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{label}:</span> {value}
    </p>
  );
}

function formatInstructorSummary(
  instructorNames: finalEvent["instructorNames"]
): string {
  if (!Array.isArray(instructorNames) || instructorNames.length === 0) {
    return "Instructor TBD";
  }

  const readable = instructorNames
    .map((name) => (typeof name === "string" ? name.trim() : ""))
    .filter(Boolean);

  if (readable.length === 0) {
    return "Instructor TBD";
  }

  if (readable.length <= 2) {
    return readable.join(", ");
  }

  return `${readable.slice(0, 2).join(", ")} +${readable.length - 2} more`;
}

