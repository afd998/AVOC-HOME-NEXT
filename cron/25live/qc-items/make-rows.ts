import { db } from "@/lib/db";
import { qcItemDict } from "@/lib/db/schema";
import {
  ProcessedEvent,
  type ActionRow,
  type QcItemRow,
} from "../../../lib/db/types";
import { type EventHybridRow } from "../../../lib/db/types";
import { type EventAVConfigRow } from "../../../lib/db/types";
import { type EventOtherHardwareRow } from "../../../lib/db/types";
import { type EventRecordingRow } from "../../../lib/db/types";
export async function makeQcItemRows(
  events: ProcessedEvent[],
  actions: ActionRow[],
  eventHybridRows: EventHybridRow[],
  eventAVConfigRows: EventAVConfigRow[],
  eventOtherHardwareRows: EventOtherHardwareRow[],
  eventRecordingRows: EventRecordingRow[]
): Promise<QcItemRow[]> {
  const qcItemRows: QcItemRow[] = [];
  actions.forEach((action) => {
    const event = events.find((event) => event.id === action.event);
    const eventRecordingRow = eventRecordingRows.find(
      (recording) => recording.event === event?.id
    );
    const eventOtherHardwareRow = eventOtherHardwareRows.find(
      (otherHardware) => otherHardware.event === event?.id
    );
    const eventAVConfigRow = eventAVConfigRows.find(
      (avConfig) => avConfig.event === event?.id
    );
    const eventHybridRow = eventHybridRows.find(
      (hybrid) => hybrid.event === event?.id
    );
    if (action.type === "CAPTURE QC") {
      let dicts = [1, 4, 7];
      eventAVConfigRow?.leftSource && dicts.push(2);
      eventAVConfigRow?.rightSource && dicts.push(3);
      eventAVConfigRow?.centerSource && dicts.push(5);
      event?.firstLecture &&
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
    if (action.type === "CONFIG") {
      let dicts = [];
      event.trasform === "COMBINE" && dicts.push(8);
      event.trasform === "UNCOMBINE" && dicts.push(9);
      eventAVConfigRow?.lapels > 1 && dicts.push(10);
      eventAVConfigRow?.handhelds > 0 && dicts.push(11);
      eventAVConfigRow?.handhelds > 1 && dicts.push(12);
      
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
