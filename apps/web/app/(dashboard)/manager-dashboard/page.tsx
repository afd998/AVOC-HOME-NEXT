import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateNumeric, formatTime } from "@/app/utils/dateTime";
import { getFailedQcItemsForDate, type FailedQcItem } from "@/lib/data/manager-dashboard/failures";
import { getDailyEventCounts, type DailyEventCounts } from "@/lib/data/manager-dashboard/summary";

const tabs = [{ value: "daily-report", label: "Daily Report" }] as const;

export default async function ManagerDashboardPage() {
  // TODO: wire this to a date picker or query param; fixed for now per request
  const selectedDate = "2025-12-07";

  let failedQcItems: FailedQcItem[] = [];
  let dailyCounts: DailyEventCounts = { events: 0, eventRecordings: 0, eventHybrids: 0 };
  try {
    failedQcItems = await getFailedQcItemsForDate(selectedDate);
  } catch (error) {
    console.error("[manager-dashboard] Failed to load failed QC items", error);
  }
  try {
    dailyCounts = await getDailyEventCounts(selectedDate);
  } catch (error) {
    console.error("[manager-dashboard] Failed to load event counts", error);
  }

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="daily-report" className="w-full space-y-4">
        <TabsList className="flex w-full max-w-xl justify-start gap-2">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-4">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="daily-report" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Daily Report</CardTitle>
              <CardDescription>
                Pull today&apos;s operational snapshot and surface key actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <DailySummary counts={dailyCounts} displayDate={selectedDate} />
              <FailedQcItemsTable items={failedQcItems} displayDate={selectedDate} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type FailedQcItemsTableProps = {
  items: FailedQcItem[];
  displayDate: string;
};

type DailySummaryProps = {
  counts: DailyEventCounts;
  displayDate: string;
};

function DailySummary({ counts, displayDate }: DailySummaryProps) {
  const formattedDate = displayDate ? formatDateNumeric(displayDate) : "Selected date";
  const summary = [
    { label: "Events", value: counts.events },
    { label: "Recordings", value: counts.eventRecordings },
    { label: "Hybrid sessions", value: counts.eventHybrids },
  ];

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Snapshot</p>
          <h3 className="text-sm font-semibold leading-none">Daily counts</h3>
          <p className="text-xs text-muted-foreground">Activity for {formattedDate}.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {summary.map((item) => (
          <div key={item.label} className="rounded-md border bg-muted/30 px-3 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <div className="mt-1 text-2xl font-semibold leading-none">{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FailedQcItemsTable({ items, displayDate }: FailedQcItemsTableProps) {
  const formattedDate = displayDate ? formatDateNumeric(displayDate) : "Selected date";
  const countLabel = items.length === 1 ? "item" : "items";

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            QC
          </p>
          <h3 className="text-sm font-semibold leading-none">Failed QC items</h3>
        </div>
        <Badge variant="outline" className="bg-muted px-3 py-1 text-xs">
          {items.length} {countLabel}
        </Badge>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">QC Item</TableHead>
              <TableHead className="w-[30%]">Event / Action</TableHead>
              <TableHead className="w-[20%]">Location / Owner</TableHead>
              <TableHead className="w-[20%]">Follow-up</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No failed QC items for {formattedDate}. Everything passed.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const timeLabel = item.startTime ? formatTime(item.startTime) : null;
                const followUp = item.failMode ?? "Needs follow-up";
                const ticketLabel = item.ticket?.trim()
                  ? `SN ${item.ticket}`
                  : "No ticket logged";
                const eventTitle = item.eventName?.trim() || "Linked event";
                const dateLabel = item.eventDate ? formatDateNumeric(item.eventDate) : formattedDate;
                const roomLabel = item.roomName ?? "Unassigned room";

                return (
                  <TableRow key={item.id} className="align-top">
                    <TableCell className="align-top">
                      <div className="flex items-start gap-2">
                        <Badge
                          variant="destructive"
                          className="rounded-full px-2 py-0.5 text-[11px]"
                        >
                          Fail
                        </Badge>
                        <div className="space-y-1">
                          <div className="text-sm font-medium leading-snug">
                            {item.qcItem}
                          </div>
                          {item.qcInstruction && (
                            <p className="text-xs leading-snug text-muted-foreground line-clamp-2">
                              {item.qcInstruction}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        {item.actionId ? (
                          <Link
                            href={`/actions/${item.actionId}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {item.actionLabel}
                          </Link>
                        ) : (
                          <div className="text-sm font-medium">{item.actionLabel}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {eventTitle} • {dateLabel}
                          {timeLabel ? ` at ${timeLabel}` : ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{roomLabel}</div>
                        {item.assignee && (
                          <p className="text-xs text-muted-foreground">
                            Assigned to {item.assignee}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <Badge
                          variant="outline"
                          className="w-fit border-destructive/60 bg-destructive/5 text-destructive"
                        >
                          {followUp}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{ticketLabel}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
