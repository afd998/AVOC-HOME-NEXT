import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarSlugLoading() {
  const rows = Array.from({ length: 10 }).map((_, i) => i);
  const barsForRow = (row: number) => {
    // deterministic-ish variety per row
    const aLeft = ((row * 7) % 60) + 4;
    const aWidth = 22 + ((row * 11) % 38);
    const bLeft = ((row * 13) % 70) + 12;
    const bWidth = 12 + ((row * 9) % 26);
    const showSecond = row % 3 === 0;
    return { aLeft, aWidth, bLeft, bWidth, showSecond };
  };

  return (
    <div className="h-full min-h-0 w-full">
      <div className="h-full min-h-0 w-full overflow-hidden rounded-md border bg-background">
        {/* top controls/header */}
        <div className="flex items-center gap-2 border-b p-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* gantt-ish grid */}
        <div className="grid h-full min-h-0 grid-cols-[92px_1fr]">
          {/* time labels */}
          <div className="border-r bg-muted/10 p-3">
            <div className="space-y-3">
              {rows.map((i) => (
                <div key={i} className="flex h-20 items-center justify-center">
                  <Skeleton className="h-4 w-14" />
                </div>
              ))}
            </div>
          </div>

          {/* timeline */}
          <div className="min-h-0 overflow-hidden">
            {/* hour markers */}
            <div className="border-b p-3">
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-10" />
                ))}
              </div>
            </div>

            <div
              className="relative h-full min-h-0 overflow-hidden"
              style={{
                backgroundImage:
                  "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)",
                backgroundSize: "12.5% 100%",
              }}
            >
              {/* rows with bars */}
              <div className="divide-y">
                {rows.map((row) => {
                  const { aLeft, aWidth, bLeft, bWidth, showSecond } =
                    barsForRow(row);
                  return (
                    <div key={row} className="flex h-20 items-center px-3">
                      <div className="relative h-12 w-full">
                        <Skeleton
                          className="absolute h-12 rounded-md"
                          style={{
                            left: `${aLeft}%`,
                            width: `${aWidth}%`,
                            top: 0,
                          }}
                        />
                        {showSecond ? (
                          <Skeleton
                            className="absolute h-12 rounded-md opacity-80"
                            style={{
                              left: `${bLeft}%`,
                              width: `${bWidth}%`,
                              top: 0,
                            }}
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


