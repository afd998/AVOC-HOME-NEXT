import { ProcessedEvent } from "../transformRawEventsToEvents/transformRawEventsToEvents";
import { db } from "../../../lib/db";
import { events as eventsTable } from "../../../drizzle/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import { InferInsertModel } from "drizzle-orm";
import { tasks } from "../../../drizzle/schema";
import { generateTaskId } from "./utils";
import { adjustTimeByMinutes } from "./utils";
type TaskRow = InferInsertModel<typeof tasks>;
export async function createFirstSessionTasks(events: ProcessedEvent[]) {
  const lectureEvents = events.filter((event) => event.eventType === "Lecture");
  if (lectureEvents.length === 0) {
    return [];
  }

  const uniqueLectureNames = new Set<string>();
  lectureEvents.forEach((event) => {
    uniqueLectureNames.add(event.eventName!);
  });

  const earliestLectureByName = new Map<string, ProcessedEvent>();

  if (uniqueLectureNames.size > 0) {
    const namesToQuery = Array.from(uniqueLectureNames);
    try {
      const namedLectures = await db
        .select()
        .from(eventsTable)
        .where(
          and(
            eq(eventsTable.eventType, "Lecture"),
            inArray(eventsTable.eventName, namesToQuery)
          )
        )
        .orderBy(
          asc(eventsTable.eventName),
          asc(eventsTable.date),
          asc(eventsTable.id)
        );

      namedLectures.forEach((lecture) => {
        const key = lecture.eventName!;
        if (!earliestLectureByName.has(key)) {
          earliestLectureByName.set(key, lecture as ProcessedEvent);
        }
      });
    } catch (error) {
      console.error("[db] addFirstSessionFlags", {
        namesToQuery,
        error,
      });
      throw error;
    }
  }
  let tasks: TaskRow[] = [];
  events.forEach((event) => {
    if (earliestLectureByName.get(event.eventName!)?.id === event.id) {
      tasks.push({
        startTime: adjustTimeByMinutes(event.startTime, -10),
        taskType: "FIRST SESSION",
        event: event.id,
        room: event.roomName,
        date: event.date,
        createdAt: new Date().toISOString(),
        status: "pending",
        assignedTo: null,
        completedBy: null,
        resource: null,
        id: generateTaskId(event.id, "FIRST SESSION", event.startTime),
        taskDict: "FIRST SESSION"
      });
    }
  });
  return tasks;
}
