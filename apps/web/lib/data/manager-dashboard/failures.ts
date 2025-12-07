import { getActionsByDate, type ActionWithDict } from "@/lib/data/actions/actions";
import { getProfileDisplayName } from "@/core/User/utils";

export type FailedQcItem = {
  id: string;
  qcItem: string;
  qcInstruction: string | null;
  actionId: number | null;
  actionLabel: string;
  eventName: string | null;
  eventDate: string | null;
  roomName: string | null;
  startTime: string | null;
  failMode: string | null;
  ticket: string | null;
  assignee: string | null;
};

function getEventName(details: ActionWithDict["eventDetails"]): string | null {
  if (!details) return null;

  const nameFromEvent = (details as any).eventName;
  if (typeof nameFromEvent === "string" && nameFromEvent.trim().length > 0) {
    return nameFromEvent;
  }

  const seriesName = details.series?.seriesName;
  if (seriesName && seriesName.trim().length > 0) {
    return seriesName;
  }

  return null;
}

function getRoomName(details: ActionWithDict["eventDetails"]): string | null {
  if (!details) return null;

  if (details.roomName && details.roomName.trim().length > 0) {
    return details.roomName;
  }

  const venue = details.venue;
  if (venue && typeof venue === "object") {
    const name = (venue as any).name ?? (venue as any).spelling;
    if (typeof name === "string" && name.trim().length > 0) {
      return name;
    }
  }

  return null;
}

function getActionLabel(action: ActionWithDict): string {
  return action.subType?.trim() || action.type?.trim() || "Action";
}

export async function getFailedQcItemsForDate(
  date: string
): Promise<FailedQcItem[]> {
  const actions = await getActionsByDate(date);

  const failedItems: FailedQcItem[] = [];

  actions.forEach((action) => {
    (action.qcItems ?? []).forEach((item) => {
      if (item.status !== "fail") return;

      const qcId = item.qcItemDict?.id ?? item.qcItemDict;
      const qcName =
        item.qcItemDict?.displayName ||
        item.qcItemDict?.instruction ||
        (typeof qcId === "number" ? `QC Item ${qcId}` : "QC Item");

      failedItems.push({
        id: `${action.id ?? "action"}-${qcId ?? "qc"}`,
        qcItem: qcName,
        qcInstruction: item.qcItemDict?.instruction ?? null,
        actionId: action.id ?? null,
        actionLabel: getActionLabel(action),
        eventName: getEventName(action.eventDetails),
        eventDate: action.eventDetails?.date ?? null,
        roomName: getRoomName(action.eventDetails),
        startTime: action.startTime ?? null,
        failMode: item.failMode ?? (item.waived ? "Waived" : null),
        ticket: item.snTicket ?? null,
        assignee: getProfileDisplayName(
          action.assignedToManualProfile ?? action.assignedToProfile
        ),
      });
    });
  });

  failedItems.sort((a, b) => {
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return a.qcItem.localeCompare(b.qcItem);
  });

  return failedItems;
}
