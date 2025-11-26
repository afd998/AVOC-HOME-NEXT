"use client";

import { useMemo } from "react";
import { CardContent } from "@/components/ui/card";
import QcItem, { useQcItemForm } from "@/core/actions/QcItem";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import { useCalendarActionsStore } from "@/app/(dashboard)/calendar/[slug]/stores/useCalendarActionsStore";
import ActionHeader from "./ActionHeader";
import ActionDetails from "./ActionDetails";
import ActionFooter from "./ActionFooter";
import { useActionCompletion } from "./hooks/useActionCompletion";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import type { CalendarEventResource } from "@/lib/data/calendar/event/utils/hydrate-event-resources";
import EventConfiguration from "@/core/event/EventDetails/EventConfiguration";

type ActionContentProps = {
  action: HydratedAction;
};

export default function ActionContent({
  action: actionProp,
}: ActionContentProps) {
  const updateAction = useCalendarActionsStore((state) => state.updateAction);
  const action = actionProp;
  
  if (!action) {
    return null;
  }
  
  const numericActionId = action.id;

  // All actions can have QC items, so always show the QC form if there are qcItems
  const hasQcItems = action.qcItems && action.qcItems.length > 0;

  // Get QC form instance if available (will be null if form not mounted)
  useQcItemForm();

  // TODO: Implement real-time updates for actions similar to tasks
  // TODO: Set up real-time subscription for action

  const { isCompleted, isCompleting, errorMessage, handleMarkCompleted } =
    useActionCompletion(action);

  // Transform eventDetails into finalEvent-like shape for downstream renderers
  const eventForConfiguration = useMemo<finalEvent | null>(() => {
    if (!action.eventDetails) return null;

    const eventDetails = action.eventDetails;

    // Transform resourceEvents to CalendarEventResource format
    const resources: CalendarEventResource[] = (
      eventDetails.resourceEvents ?? []
    )
      .map((relation) => {
        const resource = relation.resourcesDict;
        if (!resource) {
          return null;
        }

        return {
          id: resource.id,
          quantity: relation.quantity ?? 0,
          instruction: relation.instructions ?? "",
          displayName: resource.name ?? resource.id,
          isAVResource: Boolean(resource.isAv),
          is_av: Boolean(resource.isAv),
          icon: resource.icon ?? null,
        } satisfies CalendarEventResource;
      })
      .filter(
        (resource): resource is CalendarEventResource => resource !== null
      );

    // Extract first item from each relation array (one-to-one relationships)
    const hybrid =
      eventDetails.eventHybrids && eventDetails.eventHybrids.length > 0
        ? eventDetails.eventHybrids[0]
        : undefined;
    const avConfig =
      eventDetails.eventAvConfigs && eventDetails.eventAvConfigs.length > 0
        ? eventDetails.eventAvConfigs[0]
        : undefined;
    const recording =
      eventDetails.eventRecordings && eventDetails.eventRecordings.length > 0
        ? eventDetails.eventRecordings[0]
        : undefined;

    // Process other hardware (one-to-many relationship)
    const otherHardware = (eventDetails.eventOtherHardwares ?? []).map(
      (hw) => ({
        event: hw.event,
        createdAt: hw.createdAt,
        quantity: hw.quantity,
        instructions: hw.instructions,
        otherHardwareDict:
          typeof hw.otherHardwareDict === "object" &&
          hw.otherHardwareDict !== null
            ? (hw.otherHardwareDict as { id: string }).id
            : (hw.otherHardwareDict as string),
      })
    );

    // Create finalEvent-like object
    return {
      ...eventDetails,
      resources,
      hybrid,
      avConfig,
      recording,
      otherHardware,
      faculty: [], // Not needed here
      isFirstSession: false, // Not needed here
      actions: [], // Not needed here
    } as finalEvent;
  }, [action.eventDetails]);

  const isConfigAction = useMemo(() => {
    const type = action.type?.toUpperCase() || "";
    const subType = action.subType?.toUpperCase() || "";
    return type.includes("CONFIG") || subType.includes("CONFIG");
  }, [action.subType, action.type]);

  const isCaptureAction = useMemo(() => {
    const type = action.type?.toUpperCase() || "";
    const subType = action.subType?.toUpperCase() || "";
    return type.includes("CAPTURE") || subType.includes("CAPTURE");
  }, [action.subType, action.type]);

  const isStaffAssistAction = useMemo(() => {
    const type = action.type?.toUpperCase() || "";
    const subType = action.subType?.toUpperCase() || "";
    return type.includes("STAFF") || type.includes("ASSISTANCE") || subType.includes("STAFF") || subType.includes("ASSISTANCE");
  }, [action.subType, action.type]);

  const roomName = ((action.eventDetails?.roomName ?? action.room) || "").replace(/^GH\s+/i, "");

  return (
    <>
      <ActionHeader action={action} errorMessage={errorMessage} />

      <CardContent className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-6 pt-0">
        <ActionDetails action={action} />

        {isConfigAction && eventForConfiguration && (
          <EventConfiguration
            event={eventForConfiguration}
            roomName={roomName}
            showHybrid={false}
            showRecording={false}
            showAvConfig={true}
            showOtherHardware={true}
          />
        )}

        {isCaptureAction && eventForConfiguration && (
          <EventConfiguration
            event={eventForConfiguration}
            roomName={roomName}
            showHybrid={true}
            showRecording={true}
            showAvConfig={true}
            showOtherHardware={false}
          />
        )}

        {isStaffAssistAction && eventForConfiguration && (
          <EventConfiguration
            event={eventForConfiguration}
            roomName={roomName}
            showHybrid={true}
            showRecording={false}
            showAvConfig={true}
            showOtherHardware={false}
          />
        )}

        {/* Always show QC items section for all actions */}
        <QcItem action={action} />
      </CardContent>

      <ActionFooter
        action={action}
        isCompleted={isCompleted}
        isCompleting={isCompleting}
        onMarkCompleted={handleMarkCompleted}
      />
    </>
  );
}
