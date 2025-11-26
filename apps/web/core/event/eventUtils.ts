import { finalEvent } from "@/lib/data/calendar/calendar";
export function truncateEventName(event: finalEvent): string {
  const eventName = event.eventName ? String(event.eventName) : "";
  const eventType = event.eventType || "";

  // Only truncate for specific event types
  if (eventType === "Lecture" || eventType === "Exam" || eventType === "Lab") {
    const dashIndex = eventName.indexOf("-");
    return dashIndex !== -1 ? eventName.substring(0, dashIndex) : eventName;
  }

  // Return full name for all other event types (including Default)
  return eventName;
}
