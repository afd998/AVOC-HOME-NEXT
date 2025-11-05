import { truncateEventName } from "@/core/event/eventUtils";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import OwnerDisplay from "./OwnerDisplay";
import { MapPin } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import {
  ItemGroup,
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemTitle,
  ItemDescription,
} from "../../../components/ui/item";
import { Badge } from "../../../components/ui/badge";
import { OccurrencesDialogContent } from "./OccurrencesDialogContent";
import { OccurrencesModalShell } from "./OccurrencesModalShell";
import EventDetailHeaderFaculty from "./EventDetailHeaderFaculty";
import { EventFacultyList } from "./EventFacultyList";
import TwentyFiveLiveResources from "./25LiveResources";

interface EventDetailHeaderProps {
  event: finalEvent;
}

export default function EventDetailHeader({ event }: EventDetailHeaderProps) {
  return (
    <div className="bg-background rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between">
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

          <OccurrencesModalShell event={event} className="cursor-pointer">
            <OccurrencesDialogContent currentEvent={event} />
          </OccurrencesModalShell>
        </div>

        {/* <OwnerDisplay event={event} /> */}
      </div>

      {/* Right Side - Event Type/Room and Instructor Info */}
      <div className="flex-1 lg:w-1/2 lg:pl-8">
        <Card className="mb-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ItemGroup>
              <Item size="sm">
                <ItemContent>
                  <ItemTitle>Event</ItemTitle>
                </ItemContent>
              </Item>
              <Item size="sm">
                <ItemContent>
                  <ItemTitle>Type</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Badge>{event.eventType || "Unknown"}</Badge>
                </ItemActions>
              </Item>
            </ItemGroup>
          </CardContent>
        </Card>

        {event.resources.length > 0 && (
          <Card className="mb-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  25Live{"\u00ae"} Resources
                </CardTitle>
                <Badge variant="default" className="text-xs px-2 py-0.5">
                  {event.resources.length} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <TwentyFiveLiveResources resources={event.resources} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
