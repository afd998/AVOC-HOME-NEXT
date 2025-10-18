import RoomRow from "../../Schedule/components/RoomRow";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { RoomRowData } from "@/lib/data/calendar/calendar";
import { finalEvent } from "@/lib/data/calendar/calendar";

export default async function HomePage2({
  calendar,
  date,
  filter,
}: {
  calendar: RoomRowData[];
  date: string;
  filter: string;
}) {
  // "use cache";
  // cacheTag(`calendar:${date}:${filter}`);
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gpu-optimized">
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
