import { Badge } from "../../../../../components/ui/badge";
import Event from "@/app/(dashboard)/calendar/[slug]/components/Event/components/Event";    
import { finalEvent } from "@/lib/data/calendar/calendar";
import { InferSelectModel } from "drizzle-orm";
import { tasks as tasksTable } from "@/drizzle/schema";
type TaskRow = InferSelectModel<typeof tasksTable>;
import Task from "@/app/(dashboard)/calendar/[slug]/components/Tasks/Task"; 
interface RoomRowProps {
  room: string;
  roomEvents: finalEvent[];
  isEvenRow?: boolean; // Make optional with default
  isLastRow?: boolean; // Add prop for last row styling
  tasks: TaskRow[];
}

export default async function RoomRow({
  room,
  roomEvents,
  isLastRow,
  isEvenRow = false,
  tasks,
}: RoomRowProps) {
  const roomText = room.replace(/^GH\s+/, "");
  // const roomSpelling = useRoom(room); // Commented out since we're not using spelling anymore

  // Check if this room has any merged room events
  const hasMergedRoomEvents =
    roomEvents?.some(
      (event) =>
        event.roomName?.includes("&") ||
        (event.eventType === "CMC" &&
          (event.roomName === "GH 2410A" ||
            event.roomName === "GH 2410B" ||
            event.roomName?.includes("2410A") ||
            event.roomName?.includes("2410B")))
    ) || false;

  const rowHeightStyle = { height: `96px` } as const;

  return (
    <div
      className={`pl-24 flex overflow-visible ${
        isLastRow ? "rounded-b-md" : ""
      } ${
        isEvenRow
          ? "bg-muted/20 dark:bg-muted/30"
          : "bg-muted/5 dark:bg-muted/45"
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
          zIndex: 100,
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
        {tasks?.map((task: TaskRow) => (
          <Task key={task.id} task={task} rowHeightPx={96} />
        ))}
      </div>
    </div>
  );
}
