import { type ProcessedEvent, type EventHybridRow } from "shared";

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
  const instructions = stripMeetingDetails(webConferenceResource.instruction);
  return {
    event: event.id,
    config: null,
    meetingId: meetingId,
    meetingLink: meetingLink,
    instructions,
  };
}

function computeMeetingIdAndLink(instruction: string): {
  meetingId: number | null;
  meetingLink: string | null;
} {
  const meetingIdRaw =
    instruction.match(/Meeting ID:\s*([\d\s]+)/i)?.[1]?.replace(/\s+/g, "") ??
    "";
  const meetingId = meetingIdRaw ? parseInt(meetingIdRaw, 10) : null;
  const meetingLinkMatch = instruction.match(
    /Meeting LINK:\s*(https:\/\/northwestern\.zoom\.us\/(?:j|s)\/\d+)/i
  )?.[1];
  const meetingLink =
    meetingLinkMatch ?? (meetingIdRaw ? `https://northwestern.zoom.us/j/${meetingIdRaw}` : null);
  return {
    meetingId,
    meetingLink,
  };
}

function stripMeetingDetails(instruction?: string | null): string | null {
  if (!instruction) return null;

  const cleaned = instruction
    .replace(/^\s*Meeting\s+ID:\s*[\d\s]+\s*$/gim, "")
    .replace(
      /^\s*Meeting\s+LINK:\s*https:\/\/northwestern\.zoom\.us\/(?:j|s)\/\d+\s*$/gim,
      ""
    )
    .trim();

  return cleaned.length > 0 ? cleaned : null;
}
