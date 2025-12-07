import type { ActionWithDict } from "../actions/actions";

const TIMELINE_START_HOUR = 7;
const PIXELS_PER_MINUTE = 2.5;
const ROOM_LABEL_WIDTH = 96;
const EVENT_MARGIN = 1;

type ActionRow = ActionWithDict;

export type DerivedActionMetrics = {
  startMinutes: number;
  left: string;
};

export type HydratedAction = ActionRow & {
  derived: DerivedActionMetrics;
  room: string; // Derived from eventDetails.roomName
};

function getActionRoom(action: ActionRow): string {
  const eventDetails = action.eventDetails ?? null;
  if (!eventDetails) return "";

  const venue =
    typeof eventDetails.venue === "object" && eventDetails.venue !== null
      ? eventDetails.venue
      : null;

  return (
    eventDetails.roomName ??
    venue?.name ??
    venue?.spelling ??
    ""
  );
}

/**
 * Adds display columns (derived metrics) to actions for calendar rendering
 * @param actions - Array of actions to hydrate
 * @returns Array of actions with derived display metrics
 */
export function addDisplayColumns(actions: ActionRow[]): HydratedAction[] {
  return actions.map((action) => {
    const [startHour, startMin] = action.startTime.split(":").map(Number);
    const actionStartMinutes = startHour * 60 + startMin;
    const startMinutesRelative = actionStartMinutes - TIMELINE_START_HOUR * 60;
    
    // Get room name from event details or venue relation
    const room = getActionRoom(action);
    
    return {
      ...action,
      room,
      derived: {
        startMinutes: startMinutesRelative,
        left: `${
          startMinutesRelative * PIXELS_PER_MINUTE +
          EVENT_MARGIN -
          ROOM_LABEL_WIDTH
        }px`,
      },
    } as HydratedAction;
  });
}
