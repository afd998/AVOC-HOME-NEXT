import { db } from "@/lib/db";
import { qcItemDict } from "@/lib/db/schema";
import {
  type EnrichedEvent,
  type ActionRow,
  type QcItemRow,
} from "../../../lib/db/types";

export async function makeQcItemRows(
  enrichedEvents: EnrichedEvent[],
  actions: ActionRow[]
): Promise<QcItemRow[]> {
  // Build a map for O(1) lookups from action.event to enriched event
  const eventMap = new Map<number | null | undefined, EnrichedEvent>();
  enrichedEvents.forEach((event) => {
    eventMap.set(event.id, event);
  });

  const qcItemRows: QcItemRow[] = [];
  actions.forEach((action) => {
    const event = eventMap.get(action.event);
    if (!event) return;
    const eventRecordingRow = event.recording;
    const eventAVConfigRow = event.avConfig;
    const eventOtherHardware = event.otherHardware;
    const eventHybridRow = event.hybrid;
    if (action.type === "CAPTURE QC") {
      let dicts = [1, 4, 7];
      eventAVConfigRow.leftSource && dicts.push(2);
      eventAVConfigRow.rightSource && dicts.push(3);
      eventAVConfigRow.centerSource && dicts.push(5);
      event.firstLecture &&
        !eventRecordingRow?.type?.toLowerCase().includes("canvas") &&
        dicts.push(6);
      dicts.forEach((qcItemDictId) => {
        qcItemRows.push({
          action: action.id,
          qcItemDict: qcItemDictId,
          status: null,
          snTicket: null,
          waived: null,
          waivedReason: null,
          failMode: null,
          createdAt: new Date().toISOString(),
        });
      });
    }
    if (action.type === "CONFIG" && action.subType === "Set") {
      let dicts = [];
      event.transform === "COMBINE" && dicts.push(8);
      event.transform === "UNCOMBINE" && dicts.push(9);
      eventAVConfigRow.lapels && eventAVConfigRow.lapels > 1 && dicts.push(10);
      eventAVConfigRow.handhelds &&
        eventAVConfigRow.handhelds == 1 &&
        dicts.push(11);
      eventAVConfigRow.handhelds &&
        eventAVConfigRow.handhelds > 1 &&
        dicts.push(12);
      eventOtherHardware.forEach((otherHardware) => {
        if (otherHardware.otherHardwareDict === "KSM-KGH-AV-Surface Hub") {
          dicts.push(13);
        }
        if (
          otherHardware.otherHardwareDict ===
          "KSM-KGH-AV-SRS Clickers (polling)"
        ) {
          dicts.push(14);
        }
        if (otherHardware.otherHardwareDict === "KSM-KGH-AV-Laptop") {
          dicts.push(15);
        }
      });
      dicts.forEach((qcItemDictId) => {
        qcItemRows.push({
          action: action.id,
          qcItemDict: qcItemDictId,
          status: null,
          snTicket: null,
          waived: null,
          waivedReason: null,
          failMode: null,
          createdAt: new Date().toISOString(),
        });
      });
    }

    if (action.type === "CONFIG" && action.subType === "Strike") {
      let dicts = [];
      eventAVConfigRow.lapels && eventAVConfigRow.lapels > 1 && dicts.push(16);
      eventAVConfigRow.handhelds &&
        eventAVConfigRow.handhelds == 1 &&
        dicts.push(17);
      eventAVConfigRow.handhelds &&
        eventAVConfigRow.handhelds > 1 &&
        dicts.push(18);
      eventOtherHardware.forEach((otherHardware) => {
        if (otherHardware.otherHardwareDict === "KSM-KGH-AV-Surface Hub") {
          dicts.push(19);
        }
        if (
          otherHardware.otherHardwareDict ===
          "KSM-KGH-AV-SRS Clickers (polling)"
        ) {
          dicts.push(20);
        }
        if (otherHardware.otherHardwareDict === "KSM-KGH-AV-Laptop") {
          dicts.push(21);
        }
      });

      dicts.forEach((qcItemDictId) => {
        qcItemRows.push({
          action: action.id,
          qcItemDict: qcItemDictId,
          status: null,
          snTicket: null,
          waived: null,
          waivedReason: null,
          failMode: null,
          createdAt: new Date().toISOString(),
        });
      });
    }

    if (
      action.type === "Staff Assistance" &&
      action.subType === "Session Setup"
    ) {
      let dicts = [];
      eventAVConfigRow.leftSource && dicts.push(22);
      eventAVConfigRow.rightSource && dicts.push(23);
      eventAVConfigRow.centerSource && dicts.push(24);
      event.firstLecture && dicts.push(25);
      event.hybrid && dicts.push(26);
      ((eventAVConfigRow.handhelds ?? 0) > 0 ||
        (eventAVConfigRow.lapels ?? 0) > 0) &&
        dicts.push(27);

      dicts.forEach((qcItemDictId) => {
        qcItemRows.push({
          action: action.id,
          qcItemDict: qcItemDictId,
          status: null,
          snTicket: null,
          waived: null,
          waivedReason: null,
          failMode: null,
          createdAt: new Date().toISOString(),
        });
      });
    }
  });

  return qcItemRows;
}
