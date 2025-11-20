import { type ProcessedEvent } from "../../../lib/db/types";
import { type EventHybridRow } from "../../../lib/db/types";

//Meeting ID: 919 1192 8529
//Meeting LINK: https://northwestern.zoom.us/s/91911928529

export function computeEventHybrid(
  event: ProcessedEvent
): EventHybridRow | undefined {
  const webConferenceResource = event.resources.find((resource) =>
    resource.itemName.includes("Web Conference")
  );
  if (!webConferenceResource) {
    return undefined;
  }

  const { meetingId, meetingLink } = computeMeetingIdAndLink(
    webConferenceResource.instruction ?? ""
  );
  return {
    event: event.id,
    config: null,
    meetingId: meetingId,
    meetingLink: meetingLink,
    instructions: webConferenceResource.instruction ?? null,
  };
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
