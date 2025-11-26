import { type ProcessedEvent, type EnrichedEvent } from "shared";
import { computeEventHybrid } from "../event-hybrid/make-rows";
import { computeEventAVConfig } from "../event-av-config/make-rows";
import { computeEventOtherHardware } from "../event-other-hardware/make-rows";
import { computeEventRecording } from "../event-recording/make-rows";

export function enrichEvents(events: ProcessedEvent[]): EnrichedEvent[] {
  return events.map((event) => ({
    ...event,
    hybrid: computeEventHybrid(event),
    avConfig: computeEventAVConfig(event),
    otherHardware: computeEventOtherHardware(event),
    recording: computeEventRecording(event),
  }));
}

