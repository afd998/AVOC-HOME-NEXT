import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";

type CaptureQCProps = {
  task: HydratedTask;
};

export default function CaptureQC({ task }: CaptureQCProps) {
  const referenceNumber = task.id;
  const scheduledTime = task.startTime;

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase text-muted-foreground">
        Capture QC
      </h3>
      <Item className="flex flex-col gap-2" variant="outline" size="sm">
        <ItemContent className="flex flex-col gap-1">
          <ItemTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Quality Checklist
          </ItemTitle>
          <ItemDescription className="whitespace-pre-wrap text-sm text-foreground">
            Review the capture setup on-site and confirm recording readiness before the scheduled start.
            Use the task panel to log any issues you uncover and sync with operations staff if follow-up is required.
          </ItemDescription>
        </ItemContent>
      </Item>
      <div className="text-xs text-muted-foreground">
        Reference #{referenceNumber} · Scheduled {scheduledTime ?? "TBD"}
      </div>
    </section>
  );
}
