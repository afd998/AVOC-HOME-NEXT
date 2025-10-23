import { EventFacultySummary } from "@/core/event/components/EventFacultySummary";
import { Item, ItemContent } from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { finalEvent } from "@/lib/data/calendar/calendar";
import localFont from "next/font/local";
const myFont = localFont({
  src: "../../../../../../../public/fonts/Kenyan Coffee Rg.otf", 
});
function LectureEvent({ event }: { event: finalEvent }) {
  // Special case: Ad Hoc Class Meeting uses same background as main event (themeColors[5])
  // All other event types use themeColors[7] for content background

  const eventNameCopy = event.eventName ? String(event.eventName) : "";
  const parts = eventNameCopy.split(" ");
  const thirdPart = parts && parts.length >= 3 ? parts[2] : "";

  // Adjust height for merged room events
  const containerHeight = event.derived.isMergedRoomEvent ? "h-full" : "h-16"; // Use full height for merged events
  const avatarContainerHeight = "h-16"; // Keep avatar section the same height always

  const instructorNames = Array.isArray(event.instructorNames)
    ? event.instructorNames.filter(
        (name): name is string => typeof name === "string"
      )
    : [];

  const facultyCount =
    event.faculty.length > 0 ? event.faculty.length : instructorNames.length;

  // Dynamic width based on number of faculty
  const getAvatarContainerWidth = () => {
    // Use appropriate width based on faculty count
    if (facultyCount <= 1) return "w-16"; // 64px for single faculty
    if (facultyCount === 2) return "w-24"; // 96px for two faculty
    if (facultyCount >= 3) return "w-28"; // 112px for three or more faculty
    return "w-16"; // default
  };

  // Find faculty member for first instructor (for single avatar case)

  return (
    <div
      className={`flex flex-row ${containerHeight} w-full rounded absolute inset-0 p-1 transition-all duration-200 ease-in-out ${
        event.derived.isMergedRoomEvent ? "items-center" : ""
      } relative`}
    >
      <EventFacultySummary
        faculty={event.faculty}
        instructorNames={
          instructorNames.length ? instructorNames : undefined
        }
        maxVisible={3}
        size="md"
        className={cn(
          "rounded z-10 transition-all duration-200 ease-in-out relative shrink-0 -mt-1",
          avatarContainerHeight,
          getAvatarContainerWidth()
        )}
        avatarsClassName="justify-center"
        avatarClassName="!h-10 !w-10"
        overlapClassName="-space-x-2"
        remainingBadgeClassName="border-2 border-white text-white font-medium text-sm !h-10 !w-10"
        namesClassName="w-full -mt-0.5 transition-all duration-200 ease-in-out"
      />

      <div
        className={`flex flex-col min-w-0 pl-1 -gap-2 transition-all duration-200 ease-in-out overflow-hidden mt-1 ${
          event.derived.isMergedRoomEvent ? "justify-center" : ""
        }`}
      >
        <span
          className={`${myFont.className} font-medium text-black transition-all duration-200 ease-in-out whitespace-nowrap text-2xl leading-none`}
          style={{
            transformOrigin: "left center",
          }}
          title={event.eventName || ""}
        >
          {event.eventName?.substring(0, 8) || ""}
        </span>
        {thirdPart && (
          <span className="text-[10px] text-gray-400 opacity-90 transition-all duration-200 ease-in-out whitespace-nowrap leading-none">
            Sec: {thirdPart}
          </span>
        )}
        {event.lectureTitle && (
          <span
            className="text-xs text-white opacity-80 transition-all duration-200 ease-in-out whitespace-nowrap leading-none"
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            }}
            title={event.lectureTitle}
          >
            {event.lectureTitle}
          </span>
        )}
      </div>

      {/* {rowHeightPx <= 90 && (
        <div className="flex flex-col min-w-0 pl-1 -gap-2 transition-all duration-200 ease-in-out overflow-hidden  ${isMergedRoomEvent ? 'justify-center' : ''}">
          <span className="font-medium text-black transition-all duration-200 ease-in-out whitespace-nowrap text-md leading-none">
            {event.eventName}
          </span>
        </div>
      )} */}
    </div>
  );
}

// KEC Executive Luxury Event Component
function KECEvent({ event }: { event: finalEvent }) {
  const getEventHeight = () => {
    if (event.derived.isMergedRoomEvent) return "h-full";
    return "h-16";
  };

  return (
    <Item
      className={cn(
        "relative border-0 shadow-none bg-transparent py-0 my-0",
        getEventHeight(),
        event.derived.isMergedRoomEvent
          ? "flex items-center justify-center"
          : "flex items-center justify-center"
      )}
    >
      <ItemContent
        className={cn(
          "relative z-10 flex flex-col items-start justify-center h-full px-4 gap-1  my-0 py-0",
          event.derived.isMergedRoomEvent ? "py-4" : "pt-0 pb-3"
        )}
      >
        {/* Main title */}
        <div
          className={`py-0
      
          
           font-bold text-left`}
          style={{
            fontSize: event.derived.isMergedRoomEvent
              ? "1.2rem"
              : event.eventName && event.eventName.length > 15
              ? "0.7rem"
              : "0.8rem",
            color: "#B8860B",
          }}
          title={event.eventName || ""}
        >
          {event.eventName}
        </div>

        {/* Subtitle */}
        <Badge
          variant="secondary"
          className="text-left bg-transparent border-0 py-0 h-auto text-xs"
          style={{ color: "#DAA520" }}
        >
          EXECUTIVE EDUCATION
        </Badge>
      </ItemContent>
    </Item>
  );
}

// Default Event Component
function DefaultEvent({ event }: { event: finalEvent }) {
  const getEventHeight = () => {
    if (event.derived.isMergedRoomEvent) return "h-full"; // Use full height for merged room events

    return "h-12"; // 48px for regular events
  };

  return (
    <Item
      className={cn(
        "border-0 shadow-none bg-transparent text-foreground rounded transition-all duration-200 ease-in-out min-w-0 overflow-hidden relative p-0",
        getEventHeight(),

        event.eventType === "Ad Hoc Class Meeting" ? "flex items-center" : "",
        event.derived.isMergedRoomEvent
          ? "flex items-center justify-center"
          : ""
      )}
    >
      <ItemContent className="flex items-center gap-2 px-2 h-full">
        {/* {organization?.logo && (
          <Avatar className="w-6 h-6 flex-shrink-0">
            <AvatarImage
              src={organization.logo}
              alt={organization.name}
              className="object-cover"
            />
            <AvatarFallback className="text-xs">
              {organization.name?.charAt(0) || "O"}
            </AvatarFallback>
          </Avatar>
        )} */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-xs font-medium transition-all duration-200 ease-in-out w-full leading-tight"
            )}
            style={{
              transformOrigin: "left top",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              lineHeight: "1.2",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            title={event.eventName || ""}
          >
            {event.eventName || ""}
          </div>
        </div>
      </ItemContent>
    </Item>
  );
}

export default async function EventContent({
  event,
}: {
  event: finalEvent;
}) {
  // const shouldFetchOrg =
  //   event.organization === "JAPAN CLUB" ||
  //   event.organization === "KELLOGG MARKETING CLUB" ||
  //   event.organization === "KELLOGG KIDS" ||
  //   event.organization === "ASIAN MANAGEMENT ASSOCIATION" ||
  //   event.organization === "KELLOGG VETERANS ASSOCIATION" ||
  //   event.organization === "Entrepreneurship Acquisition Club";
  // const { data: organization } = useOrganization(
  //   shouldFetchOrg ? event.organization || "" : ""
  // );

  return (
    <div
      className={`flex gap-2 relative transition-all duration-200 ease-in-out flex-1 ${
        event.eventType === "KEC" ? "w-full justify-center" : "min-w-0"
      } ${event.derived.isMergedRoomEvent ? "h-full pt-6" : ""}`}
    >
      {event.eventType === "Lecture" ? (
        <LectureEvent event={event} />
      ) : event.eventType === "KEC" ? (
        <KECEvent event={event} />
      ) : (
        <DefaultEvent event={event} />
      )}
    </div>
  );
}

