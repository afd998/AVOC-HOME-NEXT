import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventOccurrences } from "@/lib/data/calendar/event/occurrences";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import {
  formatDate,
  formatTimeFromHHMMSS,
} from "@/lib/utils/timeUtils";
import EventConfiguration from "./EventConfiguration";

interface OccurrencesDialogContentProps {
  currentEvent: finalEvent;
}

export async function OccurrencesDialogContent({
  currentEvent,
}: OccurrencesDialogContentProps) {
  const occurrences = await getEventOccurrences(currentEvent.id);

  if (!currentEvent) {
    return (
      <div className="rounded-3xl border border-border bg-background p-6 text-center shadow-sm">
        Event not found
      </div>
    );
  }

  if (!occurrences || occurrences.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-background px-6 py-10 text-center text-muted-foreground">
        No occurrences found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Occurrences
            </p>
            <h2 className="text-2xl font-semibold leading-snug sm:text-3xl">
              {currentEvent.eventName}
            </h2>
          </div>
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          >
            {currentEvent.eventType || "Uncategorized"}
          </Badge>
        </div>
      </header>

      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        {occurrences.map((occurrence, index) => (
          <OccurrenceCard
            key={occurrence.id}
            occurrence={occurrence}
            index={index}
            total={occurrences.length}
            isCurrent={occurrence.id === currentEvent.id}
          />
        ))}
      </div>
    </div>
  );
}

interface OccurrenceCardProps {
  occurrence: finalEvent;
  index: number;
  total: number;
  isCurrent: boolean;
}

function OccurrenceCard({
  occurrence,
  index,
  total,
  isCurrent,
}: OccurrenceCardProps) {
  const dateLabel = formatDate(occurrence.date);
  const startLabel = formatTimeFromHHMMSS(occurrence.startTime);
  const endLabel = formatTimeFromHHMMSS(occurrence.endTime);
  const instructorSummary = formatInstructorSummary(
    occurrence.instructorNames
  );

  return (
    <Link href={`/events/${occurrence.id}`}>
      <Card className="group relative cursor-pointer transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg">
        <CardHeader className="px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                {dateLabel}
                {startLabel ? ` | ${startLabel}` : ""}
                {endLabel ? ` - ${endLabel}` : ""}
              </CardTitle>
              <CardMeta
                label="Room"
                value={occurrence.roomName || "Unknown room"}
              />
              <CardMeta label="Instructors" value={instructorSummary} />
              {occurrence.section && (
                <CardMeta label="Section" value={occurrence.section}
                />
              )}
            </div>
            <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
              {isCurrent && <Badge variant="default">Current</Badge>}
              <span>
                {index + 1} of {total}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          <EventConfiguration
            event={occurrence}
            roomName={occurrence.roomName || "Unknown room"}
            showHybrid={true}
            showRecording={true}
            showAvConfig={true}
            showOtherHardware={true}
          />
        </CardContent>
      </Card>
    </Link>
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






