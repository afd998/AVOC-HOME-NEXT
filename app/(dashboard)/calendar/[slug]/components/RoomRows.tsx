import RoomRow from "@/app/(dashboard)/calendar/[slug]/components/RoomRow";
import { RoomRowData } from "@/lib/data/calendar/calendar";
import { finalEvent } from "@/lib/data/calendar/calendar";

export default function RoomRows({ calendar }: { calendar: RoomRowData[] }) {
  return (
    <div>
      {calendar.map(
        (
          { roomName, events }: { roomName: string; events: finalEvent[] },
          index: number
        ) => {
          return (
            <RoomRow
              key={`${roomName}`}
              room={roomName}
              roomEvents={events}
              isEvenRow={index % 2 === 0}
              isLastRow={index === calendar.length - 1}
            />
          );
        }
      )}
    </div>
  );
}
