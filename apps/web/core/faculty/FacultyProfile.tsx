// import FacultyStatusBars from './FacultyStatusBars';
import { FacultyAvatar } from "./FacultyAvatar";

import { Calendar, Mail, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div className="w-full flex-shrink-0 md:basis-[40%] md:max-w-[40%]">
        <Card className="w-full flex-shrink-0 h-full">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex-shrink-0">
              {facultyMember?.kelloggdirectoryImageUrl ? (
                <FacultyAvatar
                  imageUrl={facultyMember.kelloggdirectoryImageUrl}
                  cutoutImageUrl={facultyMember.cutoutImage}
                  instructorName={facultyMember.twentyfiveliveName || ""}
                  size="lg"
                  priority
                />
              ) : (
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl">
                    DY
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg leading-tight">
                <span className="truncate">
                  {(() => {
                    const fullName = facultyMember?.kelloggdirectoryName || "";
                    const nameParts = fullName.split(" ");
                    if (nameParts.length >= 2) {
                      const firstName = nameParts[0];
                      const lastName = nameParts.slice(1).join(" ");
                      return `Dr. ${firstName} ${lastName}`;
                    }
                    return `Dr. ${fullName}`;
                  })()}
                </span>
                {facultyMember?.kelloggdirectoryBioUrl ? (
                  <a
                    href={facultyMember.kelloggdirectoryBioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                    title="Open directory profile"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Open directory profile</span>
                  </a>
                ) : null}
              </CardTitle>
              {facultyMember?.kelloggdirectoryTitle && (
                <CardDescription className="truncate">
                  {facultyMember.kelloggdirectoryTitle}
                </CardDescription>
              )}
              {facultyMember?.email && (
                <div className="flex items-start gap-2 text-sm text-primary break-words">
                  <Mail className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <a
                    href={`mailto:${facultyMember.email}`}
                    className="hover:underline break-words"
                    title={`Email ${facultyMember.kelloggdirectoryName ?? ""}`}
                  >
                    {facultyMember.email}
                  </a>
                </div>
              )}
              {facultyMember?.kelloggdirectorySubtitle ? (
                <p className="text-sm text-foreground">
                  {facultyMember.kelloggdirectorySubtitle}
                </p>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground line-clamp-8">
              {facultyMember?.kelloggdirectoryBio || "No biography available."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto sm:space-y-6 pr-1 min-h-0 md:basis-[60%] md:max-w-[60%]">
        {/* Session Setups - commented out for now */}
        {/* <Suspense
          fallback={<Skeleton className="bg-gray-200 dark:bg-gray-800 h-full w-full min-h-[120px]" />}
        >
          <SessionSetupsServer facultyMember={facultyMember} />
        </Suspense> */}

        {/* Faculty Classes List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Classes ({sortedSeries.length})
          </h2>
          
          {sortedSeries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No classes found for this faculty member.
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
