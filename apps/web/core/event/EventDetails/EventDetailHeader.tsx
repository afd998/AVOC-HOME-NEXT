"use client";

import Link from "next/link";
import { truncateEventName } from "@/core/event/eventUtils";
import { MapPin, ChevronUp, ChevronDown } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "../../../components/ui/item";
// Keeping occurrences imports for potential future use
// import { OccurrencesDialogContent } from "./OccurrencesDialogContent";
// import { OccurrencesModalShell } from "./OccurrencesModalShell";
import { EventFacultyList } from "./EventFacultyList";
import EventPageContent from "./EventPageContent";
import EventConfiguration from "./EventConfiguration";
import TwentyFiveLiveResources from "./25LiveResources";
import { Button } from "../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { useEventQuery } from "@/lib/query";

interface EventDetailHeaderProps {
  eventId: string;
}

export default function EventDetailHeader({ eventId }: EventDetailHeaderProps) {
  const { data: event, isLoading } = useEventQuery({ eventId });

  if (isLoading) {
    return (
      <EventPageContent>
        <div>Loading...</div>
      </EventPageContent>
    );
  }

  if (!event) {
    return (
      <EventPageContent>
        <div>Event not found</div>
      </EventPageContent>
    );
  }

  const venueId = event.room?.id ?? event.venue ?? null;
  const venueHref = venueId != null ? `/venues/${venueId}` : null;

  return (
    <EventPageContent>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
                  {/* First Column - Series Info */}
                  {event.seriesPos != null && event.series?.totalEvents != null && event.itemId && event.date && (
                    <Link href={`/series/${event.itemId}`} className="flex-shrink-0">
                      <Item variant="outline" className="cursor-pointer">
                        <ItemMedia variant="icon">
                          <div className="flex flex-col items-center justify-center">
                            <ChevronUp className="h-4 w-4" />
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>
                            {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </ItemTitle>
                          <ItemDescription>
                            {event.seriesPos}/{event.series.totalEvents}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </Link>
                  )}

                  {/* Second Column - Event Name, Lecture Title, Full Event Name */}
                  <div className="space-y-2">
                    {event.eventName && (
                      <h1 className="text-2xl sm:text-4xl font-bold mb-0.5 break-words">
                        {truncateEventName(event)}
                      </h1>
                    )}

                    {event.lectureTitle && (
                      <h2 className="text-md sm:text-lg font-medium mb-2 break-words">
                        "{event.lectureTitle}"
                      </h2>
                    )}

                    <p className="text-xs sm:text-sm mb-0 break-words">{event.eventName || ""}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="md:w-[260px]">
              {venueHref ? (
                <Link href={venueHref} className="flex">
                  <Item variant="outline" className="cursor-pointer w-full">
                    <ItemMedia variant="icon">
                      <MapPin className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Venue</ItemTitle>
                      <ItemDescription>
                        {(event.roomName || "Unknown").replace(/^GH\s+/i, "")}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </Link>
              ) : (
                <Item variant="outline" className="w-full">
                  <ItemMedia variant="icon">
                    <MapPin className="size-4" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Venue</ItemTitle>
                    <ItemDescription>
                      {(event.roomName || "Unknown").replace(/^GH\s+/i, "")}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              )}
            </div>
          </div>

          {event.faculty.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Faculty</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <EventFacultyList faculty={event.faculty} />
              </CardContent>
            </Card>
          )}

          {/* <OwnerDisplay event={event} /> */}
        </div>

        <div>
          <EventConfiguration event={event} roomName={event.roomName} />
          
          {event.resources.length > 0 && (
            <div className="mt-3 flex justify-end">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-auto hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>25Live{"\u00ae"} Resources</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[600px] max-w-[90vw] break-words"
                >
                  <TwentyFiveLiveResources resources={event.resources} />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
    </EventPageContent>
  );
}
