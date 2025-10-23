import type { ReactNode } from "react";

import { getDepartmentName } from "../../utils/departmentCodes";
import { truncateEventName } from "@/core/event/eventUtils";
import type { CalendarEventResource } from "@/lib/data/calendar/event/utils/hydrate-event-resources";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import OwnerDisplay from "./OwnerDisplay";
import type { FacultyAvatarItem } from "../../faculty/FacultyAvatar";
import {
  FacultyAvatarStack,
  createFacultyStub,
  getFacultyDisplayName,
  getFacultyDisplayNames,
} from "../../faculty/FacultyAvatar";
import { extractLastNames } from "../../faculty/utils";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface EventDetailHeaderProps {
  event: finalEvent;
}

export default function EventDetailHeader({ event }: EventDetailHeaderProps) {
  const ResourceSection: React.FC<{
    title: string;
    items: CalendarEventResource[];
    keyPrefix: string;
  }> = ({ title, items, keyPrefix }) => (
    <>
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="text-xs font-medium">{title}</div>
        <Badge variant="default" className="text-[10px] px-2 py-0.5">
          {items.length}
        </Badge>
      </div>
      <ItemGroup>
        {items.map((item, index) => (
          <Item key={`${keyPrefix}-${index}`} size="sm" className="flex-nowrap">
            <ItemMedia>
              <ResourceIcon icon={item.icon} />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle>{item.displayName}</ItemTitle>
              {item.instruction && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ItemDescription
                      className="truncate line-clamp-1"
                      title={item.instruction}
                    >
                      {item.instruction}
                    </ItemDescription>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5"
                      >
                        {item.id}
                      </Badge>
                    </div>
                    <div className="whitespace-pre-wrap">
                      {item.instruction}
                    </div>
                  </TooltipContent>
                </Tooltip>
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
        ))}
      </ItemGroup>
    </>
  );

  const instructorNames = Array.isArray(event.instructorNames)
    ? event.instructorNames
        .map((name) => (typeof name === "string" ? name.trim() : ""))
        .filter(Boolean)
    : [];

  const normalizedFaculty = (event.faculty ?? [])
    .filter(Boolean)
    .map((member) => member as FacultyAvatarItem);

  const fallbackFaculty =
    normalizedFaculty.length === 0
      ? instructorNames.map((name, index) =>
          createFacultyStub(name, `fallback-${index}`)
        )
      : [];

  const displayFaculty =
    normalizedFaculty.length > 0 ? normalizedFaculty : fallbackFaculty;

  const totalFacultyCount = displayFaculty.length;
  const displayedNames = getFacultyDisplayNames(displayFaculty, {
    fallbackNames: instructorNames,
    max: 3,
  });
  const allFacultyNames = getFacultyDisplayNames(displayFaculty, {
    fallbackNames: instructorNames,
  });
  const facultyNameTitle = allFacultyNames.join(", ");
  const isSingleFaculty = totalFacultyCount === 1;

  const singleFacultyFullName = isSingleFaculty
    ? getFacultyDisplayName(displayFaculty[0]) || instructorNames[0] || ""
    : "";

  let nameContent: ReactNode = null;
  if (isSingleFaculty && singleFacultyFullName) {
    const nameParts = singleFacultyFullName.split(" ");
    const isLongName = singleFacultyFullName.length > 18;
    const fontSizeClass = isLongName ? "text-[16px]" : "text-[20px]";
    nameContent =
      nameParts.length >= 2 ? (
        <>
          <div className={`-ml-2 whitespace-nowrap ${fontSizeClass}`}>
            {nameParts[0]}
          </div>
          <div className={`ml-2 whitespace-nowrap ${fontSizeClass}`}>
            {nameParts.slice(1).join(" ")}
          </div>
        </>
      ) : (
        <div className={`whitespace-nowrap ${fontSizeClass}`}>
          {singleFacultyFullName}
        </div>
      );
  } else if (displayedNames.length > 0) {
    const lastNames = extractLastNames(displayedNames);
    nameContent = lastNames ? lastNames : null;
  }

  const shouldShowFacultyNames = Boolean(nameContent);

  return (
    <div className="bg-background rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between">
      {/* Left Side - Event Info */}
      <div className="flex-1 lg:w-1/2 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {displayFaculty.length > 0 && (
                <div className="shrink-0 relative">
                  <div className="flex flex-col items-center mb-4">
                    <div className="backdrop-blur-sm bg-linear-to-br from-purple-900/20 to-blue-900/20 p-2 rounded-lg flex items-center justify-center z-20 relative border border-purple-300/20 shadow-lg">
                      <FacultyAvatarStack
                        faculty={displayFaculty}
                        maxVisible={3}
                        size={isSingleFaculty ? "lg" : "md"}
                        className="justify-center"
                        avatarClassName={
                          isSingleFaculty ? "!h-20 !w-20" : "!h-12 !w-12"
                        }
                        overlapClassName="-space-x-2"
                        remainingBadgeClassName="border-2 border-white text-white font-medium text-sm !h-12 !w-12"
                      />
                    </div>
                    {shouldShowFacultyNames && (
                      <div
                        className="absolute bottom-[-8px] left-[30%] transform -translate-x-1/2 text-[20px] leading-tight font-medium opacity-90 text-center whitespace-normal w-28 transition-all duration-200 uppercase flex flex-col items-center z-30"
                        style={{
                          fontFamily: "'Olympus Mount', sans-serif",
                          color: "transparent",
                          background:
                            "linear-gradient(-45deg, black 50%, white 50%)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                        }}
                        title={facultyNameTitle || undefined}
                      >
                        {nameContent}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex-1">
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
            </div>
          </CardContent>
        </Card>

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

          <OccurrencesModalShell
            event={event}
            className="cursor-pointer"
          >
            <OccurrencesDialogContent currentEvent={event} />
          </OccurrencesModalShell>
        </div>

        <OwnerDisplay event={event} />
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
                <ItemActions>
                  <Badge>
                    {event.eventType === "Lecture" &&
                    event.eventName &&
                    event.eventName.length >= 4
                      ? getDepartmentName(event.eventName.substring(0, 4))
                      : event.eventName || "Unknown"}
                  </Badge>
                </ItemActions>
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

              return (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div>
                      {(avResources.length > 0 ||
                        otherResources.length === 0) && (
                        <ResourceSection
                          title="AV Resources"
                          items={avResources}
                          keyPrefix="av"
                        />
                      )}
                    </div>
                    <div>
                      {otherResources.length > 0 && (
                        <ResourceSection
                          title="General Resources"
                          items={otherResources}
                          keyPrefix="other"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              );
            })()}
          </Card>
        )}
      </div>
    </div>
  );
}


