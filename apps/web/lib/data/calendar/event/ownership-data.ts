import { eq, db, shiftBlocks, type ShiftBlock } from "shared";
import { finalEvent } from "../calendar";

interface IntersectingBlock {
  blockId: number;
  startTime: string;
  endTime: string;
  owners: string[];
}

// Processed ownership data
interface OwnershipData {
  owners: string[];
  handOffTimes: string[];
}

// Timeline entry for ownership display
interface OwnershipTimelineEntry {
  ownerId: string;
  transitionTime?: string; // undefined for the last owner
}

export const getOwnershipData = async (event: finalEvent) => {
  const shiftBlocks = await getShiftBlocks(event.date);
  const intersectingBlocks = getIntersectingBlocks(event, shiftBlocks);
  // Process ownership data
  const ownershipData = processOwnershipData(intersectingBlocks);

  // Create timeline for display
  const timeline = createOwnershipTimeline(
    ownershipData.owners,
    ownershipData.handOffTimes,
    event.manOwner
  );
  return {
    owners: ownershipData.owners,
    handOffTimes: ownershipData.handOffTimes,
    timeline: timeline,
  };
};

// Get intersecting shift blocks for an event
function getIntersectingBlocks(
  event: finalEvent,
  shiftBlocks: ShiftBlock[]
): IntersectingBlock[] {
  const eventDate = event.date;
  const eventStartTime = event.startTime;
  const eventEndTime = event.endTime;
  const eventRoom = event.roomName;

  // Find shift blocks that overlap with the event
  const relevantBlocks = shiftBlocks.filter((block) => {
    if (!block.date || !block.startTime || !block.endTime) return false;
    // Check if block is for the same date
    if (block.date !== eventDate) return false;

    // Check if block overlaps with event time
    const blockStart = block.startTime;
    const blockEnd = block.endTime;

    // Event overlaps with block
    const overlaps =
      (eventStartTime >= blockStart && eventStartTime < blockEnd) ||
      (eventEndTime > blockStart && eventEndTime <= blockEnd) ||
      (eventStartTime <= blockStart && eventEndTime >= blockEnd);

    return overlaps;
  });

  // For each relevant block, find who owns the event's room
  const intersectingBlocks: IntersectingBlock[] = [];

  relevantBlocks.forEach((block) => {
    if (!block.startTime || !block.endTime || !block.assignments) return;

    // Find who is assigned to the event's room during this block
    const owners: string[] = [];
    if (Array.isArray(block.assignments)) {
      block.assignments.forEach((assignment: any) => {
        if (assignment && assignment.rooms && Array.isArray(assignment.rooms)) {
          if (assignment.rooms.includes(eventRoom)) {
            owners.push(assignment.user);
          }
        }
      });
    }

    intersectingBlocks.push({
      blockId: block.id,
      startTime: block.startTime,
      endTime: block.endTime,
      owners: owners,
    });
  });

  // Sort by start time
  return intersectingBlocks.sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );
}

// Process intersecting blocks to get owners and hand-off times
function processOwnershipData(
  intersectingBlocks: IntersectingBlock[]
): OwnershipData {
  if (intersectingBlocks.length === 0) {
    return { owners: [], handOffTimes: [] };
  }

  // Collect all unique owners
  const allOwners = new Set<string>();
  intersectingBlocks.forEach((block) => {
    block.owners.forEach((owner) => allOwners.add(owner));
  });

  // Find hand-off times between consecutive blocks
  const handOffTimes: string[] = [];

  for (let i = 0; i < intersectingBlocks.length - 1; i++) {
    const currentBlock = intersectingBlocks[i];
    const nextBlock = intersectingBlocks[i + 1];

    // Check if ownership changed between blocks
    const currentOwners = new Set(currentBlock.owners);
    const nextOwners = new Set(nextBlock.owners);

    // If the sets are different, there's a hand-off
    const hasHandOff =
      currentOwners.size !== nextOwners.size ||
      !Array.from(currentOwners).every((owner) => nextOwners.has(owner));

    if (hasHandOff) {
      handOffTimes.push(currentBlock.endTime);
    }
  }

  return {
    owners: Array.from(allOwners),
    handOffTimes,
  };
}

// Create timeline entries for ownership display
function createOwnershipTimeline(
  owners: string[],
  handOffTimes: string[],
  manualOwner?: string | null
): OwnershipTimelineEntry[] {
  const timeline: OwnershipTimelineEntry[] = [];

  // If there's a manual owner, show it first
  if (manualOwner) {
    timeline.push({
      ownerId: manualOwner,
      transitionTime: undefined, // Manual owner doesn't have transition time
    });
    return timeline;
  }

  // Otherwise, show calculated owners from shift blocks
  if (owners.length === 0) return [];

  owners.forEach((ownerId, index) => {
    timeline.push({
      ownerId,
      transitionTime:
        index < handOffTimes.length ? handOffTimes[index] : undefined,
    });
  });

  return timeline;
}

async function getShiftBlocks(date: string): Promise<ShiftBlock[]> {
  try {
    const shiftBlocksData = await db.query.shiftBlocks.findMany({
      where: eq(shiftBlocks.date, date),
    });
    return shiftBlocksData;
  } catch (error) {
    console.error("[db] events.getShiftBlocks", { date, error });
    throw error;
  }
}
