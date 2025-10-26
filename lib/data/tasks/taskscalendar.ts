import { getFilters } from "../filters";
import { RoomFilter } from "@/lib/db/types";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getTasksByDate } from "./tasks";
import { tasks as tasksTable } from "@/drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

type TaskRow = InferSelectModel<typeof tasksTable>;

export async function getTasksCalendar(
  date: string,
  filter: string,
  autoHide: boolean
) {
  "use cache";
  cacheTag(`calendar:${date}:${filter}:${autoHide ? "hide" : "show"}`);
  const rawTasks = await (async () => {
    try {
      return await getTasksByDate(date);
    } catch (error) {
      throw error;
    }
  })();
  
  const filteredTasks = await filterTasks(rawTasks, filter);
  const roomGroups = groupTasksByRoom(filteredTasks);
  const finalRoomGroups = handleMergedRooms(roomGroups);
  const visibleRoomGroups = autoHide
    ? finalRoomGroups.filter((group) => group.tasks.length > 0)
    : finalRoomGroups;

  // Sort by roomName with letters before numbers, omitting first 3 chars ("GH ")
  visibleRoomGroups.sort((a, b) => {
    // Skip first 3 characters ("GH ") and get the actual room identifier
    const aRoomId = a.roomName.substring(3);
    const bRoomId = b.roomName.substring(3);

    const aFirstChar = aRoomId.charAt(0);
    const bFirstChar = bRoomId.charAt(0);
    const aIsLetter = /[A-Za-z]/.test(aFirstChar);
    const bIsLetter = /[A-Za-z]/.test(bFirstChar);

    // If a starts with letter and b doesn't, a comes first
    if (aIsLetter && !bIsLetter) return -1;
    // If b starts with letter and a doesn't, b comes first
    if (!aIsLetter && bIsLetter) return 1;

    // Both are same type, sort alphabetically by room identifier
    return aRoomId.localeCompare(bRoomId);
  });

  return visibleRoomGroups;
}

function groupTasksByRoom(
  tasks: TaskRow[]
): { roomName: string; tasks: TaskRow[] }[] {
  // Group events by roomName
  const groupedTasks = tasks.reduce((acc, task) => {
    const roomName = task.room;
    if (!acc[roomName]) {
      acc[roomName] = [];
    }
    acc[roomName].push(task);
    return acc;
  }, {} as Record<string, TaskRow[]>);

  // Convert to array of objects
  return Object.entries(groupedTasks).map(([roomName, tasks]) => ({
    roomName,
    tasks,
  }));
}

function handleMergedRooms(
  roomGroups: { roomName: string; tasks: TaskRow[] }[]
): { roomName: string; tasks: TaskRow[] }[] {
  // Ensure any "&" rooms also create groups for the additional rooms they reference.
  const existingRoomNames = new Set(roomGroups.map((group) => group.roomName));
  roomGroups.forEach((group) => {
    if (!group.roomName.includes("&")) return;

    const expandedNames = expandMergedRoomNames(group.roomName).slice(1);
    expandedNames.forEach((name) => {
      if (existingRoomNames.has(name)) return;
      const emptyGroup: { roomName: string; tasks: TaskRow[] } = {
        roomName: name,
        tasks: [],
      };
      roomGroups.push(emptyGroup);
      existingRoomNames.add(name);
    });
  });

  // Normalize "&" room names by merging their events into the first segment (base room).
  for (let i = roomGroups.length - 1; i >= 0; i--) {
    const room = roomGroups[i];
    if (!room.roomName.includes("&")) continue;

    const baseRoomName = room.roomName.split("&")[0].trim();
    const targetIndex = roomGroups.findIndex(
      (candidate) => candidate.roomName === baseRoomName
    );

    if (targetIndex !== -1) {
      roomGroups[targetIndex].tasks = [
        ...roomGroups[targetIndex].tasks,
        ...room.tasks,
      ];
    } else {
      roomGroups.push({
        roomName: baseRoomName,
        tasks: [...room.tasks],
      });
    }

    roomGroups.splice(i, 1);
  }

  return roomGroups;
}

function expandMergedRoomNames(roomName: string): string[] {
  const trimmedName = roomName.trim();
  if (!trimmedName.includes("&")) {
    return [trimmedName];
  }

  const segments = trimmedName.split("&").map((segment) => segment.trim());
  const [firstSegment, ...restSegments] = segments;

  if (!firstSegment) {
    return [trimmedName];
  }

  const lastSpaceIndex = firstSegment.lastIndexOf(" ");
  const prefix =
    lastSpaceIndex >= 0 ? firstSegment.slice(0, lastSpaceIndex + 1) : "";
  const baseSuffix = firstSegment.slice(lastSpaceIndex + 1);

  const expandedSegments = [firstSegment];

  restSegments.forEach((segment) => {
    if (!segment) return;

    if (segment.includes(" ")) {
      expandedSegments.push(segment);
      return;
    }

    if (baseSuffix.length >= segment.length && baseSuffix.length > 0) {
      const mergedSuffix =
        baseSuffix.slice(0, baseSuffix.length - segment.length) + segment;
      expandedSegments.push(`${prefix}${mergedSuffix}`);
      return;
    }

    expandedSegments.push(`${prefix}${segment}`);
  });

  return expandedSegments;
}

async function filterTasks(
  tasksToFilter: TaskRow[],
  filter: string
): Promise<TaskRow[]> {
  if (filter === "All Rooms") {
    return tasksToFilter;
  }

  if (filter === "My Events") {
    return tasksToFilter;
  }

  const roomFilters: RoomFilter[] = await getFilters();
  const filterObject = roomFilters.find((f: RoomFilter) => f.name === filter);
  if (!filterObject) {
    return tasksToFilter;
  }

  const allowedRooms = new Set(filterObject.display as string[]);
  return tasksToFilter.filter((task) => allowedRooms.has(task.room));
}
