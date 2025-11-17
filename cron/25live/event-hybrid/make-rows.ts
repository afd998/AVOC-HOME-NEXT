import { type ProcessedEvent } from "../../../lib/db/types";
import { type EventHybridRow } from "../../../lib/db/types";

//Meeting ID: 919 1192 8529
//Meeting LINK: https://northwestern.zoom.us/s/91911928529

export function makeEventHybridRows(
  events: ProcessedEvent[]
): EventHybridRow[] {
  const eventHybridRows: EventHybridRow[] = [];
  events.forEach((event) => {
    const webConferenceResources = event.resources.filter((resource) =>
      resource.itemName.includes("Web Conference")
    );
    if (webConferenceResources.length < 0) {
      return;
    }
    const webConferenceResource = webConferenceResources[0];

    const { meetingId, meetingLink } = computeMeetingIdAndLink(
      webConferenceResource.instruction ?? ""
    );
    eventHybridRows.push({
      event: event.id,
      config: null,
      meetingId: meetingId,
      meetingLink: meetingLink,
      instructions: webConferenceResource.instruction ?? null,
    });
  });
  return eventHybridRows;
}

function computeMeetingIdAndLink(instruction: string): {
  meetingId: number | null;
  meetingLink: string | null;
} {
  const meetingId = instruction.match(/Meeting ID: (\d+)/)?.[1];
  const meetingLink = instruction.match(
    /Meeting LINK: (https:\/\/northwestern\.zoom\.us\/s\/\d+)/
  )?.[1];
  return {
    meetingId: meetingId ? parseInt(meetingId) : null,
    meetingLink: meetingLink ?? null,
  };
}
