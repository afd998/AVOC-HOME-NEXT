import type {
  EnrichedEvent,
  ActionRow,
  QcItemRow,
} from "../db/types";

/**
 * Generates QC items for a single action based on the enriched event data.
 * This is the core logic that determines which QC dict IDs apply to an action.
 */
export function generateQcItemsForAction(
  action: ActionRow,
  event: EnrichedEvent
): QcItemRow[] {
  const qcItemRows: QcItemRow[] = [];
  const eventRecordingRow = event.recording;
  const eventAVConfigRow = event.avConfig;
  const eventOtherHardware = event.otherHardware;

  const createQcItem = (qcItemDictId: number): QcItemRow => ({
    action: action.id,
    qcItemDict: qcItemDictId,
    status: null,
    snTicket: null,
    waived: null,
    waivedReason: null,
    failMode: null,
    createdAt: new Date().toISOString(),
  });

  if (action.type === "CAPTURE QC") {
    const dicts = [1, 4, 7];
    if (eventAVConfigRow.leftSource) dicts.push(2);
    if (eventAVConfigRow.rightSource) dicts.push(3);
    if (eventAVConfigRow.centerSource) dicts.push(5);
    if (
      event.firstLecture &&
      !eventRecordingRow?.type?.toLowerCase().includes("canvas")
    ) {
      dicts.push(6);
    }
    dicts.forEach((id) => qcItemRows.push(createQcItem(id)));
  }

  if (action.type === "CONFIG" && action.subType === "Set") {
    const dicts: number[] = [];
    if (event.transform === "COMBINE") dicts.push(8);
    if (event.transform === "UNCOMBINE") dicts.push(9);
    if (eventAVConfigRow.lapels && eventAVConfigRow.lapels > 1) dicts.push(10);
    if (eventAVConfigRow.handhelds && eventAVConfigRow.handhelds === 1)
      dicts.push(11);
    if (eventAVConfigRow.handhelds && eventAVConfigRow.handhelds > 1)
      dicts.push(12);

    eventOtherHardware.forEach((otherHardware) => {
      if (otherHardware.otherHardwareDict === "KSM-KGH-AV-Surface Hub") {
        dicts.push(13);
      }
      if (
        otherHardware.otherHardwareDict === "KSM-KGH-AV-SRS Clickers (polling)"
      ) {
        dicts.push(14);
      }
      if (otherHardware.otherHardwareDict === "KSM-KGH-AV-Laptop") {
        dicts.push(15);
      }
    });

    dicts.forEach((id) => qcItemRows.push(createQcItem(id)));
  }

  if (action.type === "CONFIG" && action.subType === "Strike") {
    const dicts: number[] = [];
    if (eventAVConfigRow.lapels && eventAVConfigRow.lapels > 1) dicts.push(16);
    if (eventAVConfigRow.handhelds && eventAVConfigRow.handhelds === 1)
      dicts.push(17);
    if (eventAVConfigRow.handhelds && eventAVConfigRow.handhelds > 1)
      dicts.push(18);

    eventOtherHardware.forEach((otherHardware) => {
      if (otherHardware.otherHardwareDict === "KSM-KGH-AV-Surface Hub") {
        dicts.push(19);
      }
      if (
        otherHardware.otherHardwareDict === "KSM-KGH-AV-SRS Clickers (polling)"
      ) {
        dicts.push(20);
      }
      if (otherHardware.otherHardwareDict === "KSM-KGH-AV-Laptop") {
        dicts.push(21);
      }
    });

    dicts.forEach((id) => qcItemRows.push(createQcItem(id)));
  }

  if (action.type === "Staff Assistance" && action.subType === "Session Setup") {
    const dicts: number[] = [];
    if (eventAVConfigRow.leftSource) dicts.push(22);
    if (eventAVConfigRow.rightSource) dicts.push(23);
    if (eventAVConfigRow.centerSource) dicts.push(24);
    if (event.firstLecture) dicts.push(25);
    if (event.hybrid) dicts.push(26);
    if (
      (eventAVConfigRow.handhelds ?? 0) > 0 ||
      (eventAVConfigRow.lapels ?? 0) > 0
    ) {
      dicts.push(27);
    }

    dicts.forEach((id) => qcItemRows.push(createQcItem(id)));
  }

  return qcItemRows;
}

/**
 * Generates QC items for multiple actions across multiple events.
 * This is the batch version used by the scraper.
 */
export function generateQcItems(
  enrichedEvents: EnrichedEvent[],
  actions: ActionRow[]
): QcItemRow[] {
  // Build a map for O(1) lookups from action.event to enriched event
  const eventMap = new Map<number | null | undefined, EnrichedEvent>();
  enrichedEvents.forEach((event) => {
    eventMap.set(event.id, event);
  });

  const qcItemRows: QcItemRow[] = [];
  actions.forEach((action) => {
    const event = eventMap.get(action.event);
    if (!event) return;
    qcItemRows.push(...generateQcItemsForAction(action, event));
  });

  return qcItemRows;
}

