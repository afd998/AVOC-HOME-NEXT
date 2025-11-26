// import FacultyStatusBars from './FacultyStatusBars';
import { FacultyAvatar } from "./FacultyAvatar";

import { ExternalLink, Calendar } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface ResourceItem {
  itemName: string;
  quantity?: number;
  [key: string]: any;
}
import type { Faculty, Event } from "shared/db/types";
import { getFacultyEvents } from "@/lib/data/faculty";
// import SessionSetupsServer from "./SessionSetupsServer";
export default async function FacultyProfile({
  facultyMember,
}: {
  facultyMember: Faculty;
}) {
  // State for faculty photo hover effects

  // BYOD handled in BYODDevicesCard

  if (!facultyMember) {
    return <div>Faculty member not found</div>;
  }

  const events = await getFacultyEvents(facultyMember.id);

  // Group events by series (itemId) and get one representative event per series
  const seriesMap = new Map<number, Event>();
  for (const event of events) {
    if (event.itemId && !seriesMap.has(event.itemId)) {
      seriesMap.set(event.itemId, event);
    }
  }
  const series = Array.from(seriesMap.values());

  // Sort series by event name
  const sortedSeries = [...series].sort((a, b) => 
    (a.eventName || "").localeCompare(b.eventName || "")
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-6 overflow-hidden bg-background text-foreground border border-white/20 dark:border-white/10 p-3 sm:p-6 md:flex-row">
      <div className="w-full flex-shrink-0 md:basis-[30%] md:max-w-[30%]">
        <Item variant="outline" className="w-full flex-shrink-0">
          <ItemMedia>
            {facultyMember?.kelloggdirectoryImageUrl ? (
              <div>
                <FacultyAvatar
                  imageUrl={facultyMember.kelloggdirectoryImageUrl}
                  cutoutImageUrl={facultyMember.cutoutImage}
                  instructorName={facultyMember.twentyfiveliveName || ""}
                  size="lg"
                  priority
                />
              </div>
            ) : (
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl">
                  DY
                </span>
              </div>
            )}
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              <span className="text-base sm:text-lg font-medium truncate">
                {(() => {
                  const fullName = facultyMember?.kelloggdirectoryName || "";
                  const nameParts = fullName.split(" ");
                  if (nameParts.length >= 2) {
                    const firstName = nameParts[0];
                    const lastName = nameParts.slice(1).join(" ");
                    return `Dr. ${firstName} - ${lastName}`;
                  }
                  return `Dr. ${fullName}`;
                })()}
              </span>
            </ItemTitle>
            {facultyMember?.kelloggdirectoryTitle && (
              <ItemDescription className="truncate">
                {facultyMember.kelloggdirectoryTitle}
              </ItemDescription>
            )}
          </ItemContent>
          <ItemActions>
            {facultyMember?.kelloggdirectoryBioUrl && (
              <a
                href={facultyMember.kelloggdirectoryBioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors shrink-0"
                title="View faculty directory page"
                aria-label="Open faculty profile"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </ItemActions>
        </Item>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto sm:space-y-6 pr-1 min-h-0 md:basis-[70%] md:max-w-[70%]">
        {/* Session Setups - commented out for now */}
        {/* <Suspense
          fallback={<Skeleton className="bg-gray-200 dark:bg-gray-800 h-full w-full min-h-[120px]" />}
        >
          <SessionSetupsServer facultyMember={facultyMember} />
        </Suspense> */}

        {/* Faculty Series List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Series ({sortedSeries.length})
          </h2>
          
          {sortedSeries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No series found for this faculty member.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {sortedSeries.map((event) => (
                <Link 
                  key={event.itemId} 
                  href={`/series/${event.itemId}`}
                  className="block"
                >
                  <Card className="transition-all hover:bg-muted/50 cursor-pointer">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm font-medium">
                        {event.eventName}
                      </CardTitle>
                      {event.eventType && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {event.eventType}
                        </div>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
