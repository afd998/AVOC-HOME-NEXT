import { Badge } from "../../../../../components/ui/badge";
import Event from "@/app/(dashboard)/calendar/[slug]/components/Event/components/Event";
import { finalEvent } from "@/lib/data/calendar/calendar";

import Tasks from "@/app/(dashboard)/calendar/[slug]/components/Tasks/Tasks";
interface RoomRowProps {
  room: string;
  roomEvents: finalEvent[];
  isEvenRow?: boolean; // Make optional with default
  isLastRow?: boolean; // Add prop for last row styling
}

export default function RoomRow({
  room,
  roomEvents,
  isLastRow,
  isEvenRow = false,
}: RoomRowProps) {
  const roomText = room.replace(/^GH\s+/, "");
  const rowHeightStyle = { height: `96px` } as const;

  return (
    <div
      className={` flex overflow-visible ${
        isLastRow ? "rounded-b-md" : ""
      } ${
        isEvenRow
          ? "bg-muted/80 dark:bg-muted/100"
          : "bg-muted/5 dark:bg-muted/85"
      }`}
      style={{
        ...rowHeightStyle,
      }}
    >
      <div
        className={`sticky bg-backgroun/80 left-0 w-24 flex flex-col items-center justify-center  transition-all duration-300 ease-in-out cursor-pointer event-no-select ${
          isLastRow ? "rounded-bl-md" : ""
        }`}
        style={{
          zIndex: 36,
          ...rowHeightStyle,
        }}
        data-room-label="true"
      >
        <Badge
          className={``}
          style={{
            // fontFamily: fontFamily,
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          {roomText}
        </Badge>
        {/* Room spelling code commented out - now just showing simple room name vertically */}
      </div>

      <div
        className={`flex-1 relative transition-all duration-300 ease-in-out overflow-visible ${
          isLastRow ? "rounded-br-md" : ""
        }`}
        style={{ ...rowHeightStyle }}
      >
        {roomEvents?.map((event: finalEvent) => (
          <Event key={event.id} event={event} rowHeightPx={96} />
        ))}
        <Tasks roomName={room} rowHeightPx={96} />
      </div>
    </div>
  );
}
