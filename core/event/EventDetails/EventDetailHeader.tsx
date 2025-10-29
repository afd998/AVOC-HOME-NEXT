import { truncateEventName } from "@/core/event/eventUtils";
import type { CalendarEventResource } from "@/lib/data/calendar/event/utils/hydrate-event-resources";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import OwnerDisplay from "./OwnerDisplay";
import { MapPin } from "lucide-react";
import { ResourceIcon } from "@/core/event/resourceIcon";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EventDetailHeaderProps {
  event: finalEvent;
}

export default function EventDetailHeader({ event }: EventDetailHeaderProps) {
  const ResourceSection: React.FC<{
    items: CalendarEventResource[];
    emptyMessage?: string;
  }> = ({ items, emptyMessage }) => {
    if (items.length === 0) {
      return (
        <div className="py-4 text-sm text-muted-foreground">
          {emptyMessage ?? "No resources to display."}
        </div>
      );
    }

    return (
      <ItemGroup>
        {items.map((item, index) => (
          <Popover key={`${item.id}-${index}`}>
            <PopoverTrigger asChild>
              <Item
                size="sm"
                className="flex-nowrap cursor-pointer transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <ItemMedia>
                  <ResourceIcon icon={item.icon} />
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle>{item.displayName}</ItemTitle>
                  <div className="text-xs font-medium text-muted-foreground">
                    {item.id}
                  </div>
                  {item.instruction && (
                    <ItemDescription className="line-clamp-1 truncate">
                      {item.instruction}
                    </ItemDescription>
                  )}
                </ItemContent>
                {item.quantity && item.quantity > 1 && (
                  <ItemActions>
                    <Badge variant="default" className="text-[10px] px-2 py-0.5">
                      ×{item.quantity}
                    </Badge>
                  </ItemActions>
                )}
              </Item>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="max-w-sm space-y-3 text-sm"
            >
              <div className="space-y-2">
                <div className="text-sm font-semibold leading-tight">
                  {item.displayName}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  {item.id}
                </div>
                {item.quantity && item.quantity > 1 && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                    Quantity: {item.quantity}
                  </Badge>
                )}
              </div>
              <div className="whitespace-pre-wrap text-muted-foreground">
                {item.instruction ?? "No additional instructions provided."}
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </ItemGroup>
    );
  };

  return (
    <div className="bg-background rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between">
      {/* Left Side - Event Info */}
      <div className="flex-1 lg:w-1/2 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              {event.eventName && (
                <h1
                  className="text-2xl sm:text-4xl font-bold mb-0.5 uppercase"
                  style={{ fontFamily: "'Olympus Mount', sans-serif" }}
                >
                  {truncateEventName(event)}
                </h1>
              )}

              {event.lectureTitle && (
                <h2
                  className="text-lg sm:text-2xl font-medium mb-2 ml-4 break-words"
                  style={{ fontFamily: "'GoudyBookletter1911', serif" }}
                >
                  {event.lectureTitle}
                </h2>
              )}

              <p className="text-xs sm:text-sm mb-0">
                {event.eventName || ""}
              </p>
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
              <ItemTitle>Room</ItemTitle>
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
                <CardTitle className="text-base">Resources</CardTitle>
                <Badge variant="default" className="text-xs px-2 py-0.5">
                  {event.resources.length} total
                </Badge>
              </div>
            </CardHeader>
            {(() => {
              const avResources = event.resources.filter(
                (item) => item.isAVResource
              );
              const otherResources = event.resources.filter(
                (item) => !item.isAVResource
              );
              const hasAV = avResources.length > 0;
              const hasGeneral = otherResources.length > 0;
              const defaultTab = hasAV ? "av" : "general";
              const triggerCount = Number(hasAV) + Number(hasGeneral);
              const listColumnClass =
                triggerCount > 1 ? "grid-cols-2" : "grid-cols-1";

              return (
                <CardContent className="pt-0">
                  <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList
                      className={`grid ${listColumnClass} gap-2 bg-transparent p-0`}
                    >
                      {hasAV && (
                        <TabsTrigger
                          value="av"
                          className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-primary/10"
                        >
                          AV Resources
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-2 py-0.5"
                          >
                            {avResources.length}
                          </Badge>
                        </TabsTrigger>
                      )}
                      {hasGeneral && (
                        <TabsTrigger
                          value="general"
                          className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-primary/10"
                        >
                          General Resources
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-2 py-0.5"
                          >
                            {otherResources.length}
                          </Badge>
                        </TabsTrigger>
                      )}
                    </TabsList>

                    {hasAV && (
                      <TabsContent
                        value="av"
                        className="mt-4 space-y-2 focus-visible:outline-none"
                      >
                        <ResourceSection
                          items={avResources}
                          emptyMessage="No AV resources available."
                        />
                      </TabsContent>
                    )}
                    {hasGeneral && (
                      <TabsContent
                        value="general"
                        className="mt-4 space-y-2 focus-visible:outline-none"
                      >
                        <ResourceSection
                          items={otherResources}
                          emptyMessage="No general resources available."
                        />
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              );
            })()}
          </Card>
        )}
      </div>
    </div>
  );
}
