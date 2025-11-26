import Link from "next/link";
import { truncateEventName } from "@/core/event/eventUtils";
import type { finalEvent } from "@/lib/data/calendar/calendar";
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
import {
  formatDate,
  formatTimeFromHHMMSS,
} from "@/lib/utils/timeUtils";

interface EventDetailHeaderProps {
  event: finalEvent;
}

export default function EventDetailHeader({ event }: EventDetailHeaderProps) {
  return (
    <EventPageContent>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
      {/* Left Side - Event Info */}
      <div className="flex-1 lg:w-1/2 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              {event.eventName && (
                <h1 className="text-2xl sm:text-4xl font-bold mb-0.5 uppercase">
                  {truncateEventName(event)}
                </h1>
              )}

              {event.lectureTitle && (
                <h2 className="text-md sm:text-lg font-medium mb-2 = break-words">
                  "{event.lectureTitle}"
                </h2>
              )}

              <p className="text-xs sm:text-sm mb-0">{event.eventName || ""}</p>
            </div>
          </CardContent>
        </Card>

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

        <div className="flex items-start gap-3 mb-3 sm:mb-4">
          <Item variant="outline">
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

          {event.itemId && (
            <Link href={`/series/${event.itemId}`}>
              <Item variant="outline" className="cursor-pointer">
                <ItemMedia variant="icon">
                  <div className="flex flex-col items-center justify-center">
                    <ChevronUp className="h-4 w-4" />
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Series</ItemTitle>
                  <ItemDescription>
                    {formatDate(event.date)}
                    {formatTimeFromHHMMSS(event.startTime) ? ` | ${formatTimeFromHHMMSS(event.startTime)}` : ""}
                    {formatTimeFromHHMMSS(event.endTime) ? ` - ${formatTimeFromHHMMSS(event.endTime)}` : ""}
                    <span className="ml-1 text-xs text-muted-foreground">CST</span>
                  </ItemDescription>
                </ItemContent>
              </Item>
            </Link>
          )}
        </div>

        {/* <OwnerDisplay event={event} /> */}
      </div>

      {/* Right Side - Event Type/Room and Instructor Info */}
      <div className="flex-1 lg:w-1/2 lg:pl-8">
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
