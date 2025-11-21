"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CaptureQC, { useCaptureQCForm } from "@/core/tasks/CaptureQC";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import { useCalendarActionsStore } from "@/app/(dashboard)/calendar/[slug]/stores/useCalendarActionsStore";
import ActionHeader from "./ActionHeader";
import ActionDetails from "./ActionDetails";
import ActionFooter from "./ActionFooter";
import { useActionCompletion } from "./hooks/useActionCompletion";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import type { CalendarEventResource } from "@/lib/data/calendar/event/utils/hydrate-event-resources";
import type { EventAVConfigRow } from "@/lib/db/types";
import AvConfiguration from "@/core/av-config/AvConfiguration";
import HybridConfiguration from "@/core/event/EventDetails/HybridConfiguration";
import RecordingConfiguration from "@/core/event/EventDetails/RecordingConfiguration";

type ActionContentProps = {
  action: HydratedAction;
};

export default function ActionContent({
  action: actionProp,
}: ActionContentProps) {
  const router = useRouter();
  const updateAction = useCalendarActionsStore((state) => state.updateAction);
  const action = actionProp;
  const numericActionId = action.id;

  // All actions can have QC items, so always show the QC form if there are qcItems
  const hasQcItems = action.qcItems && action.qcItems.length > 0;

  // Get QC form instance if available (will be null if form not mounted)
  useCaptureQCForm();

  // Update Zustand store when real-time updates occur
  // TODO: Implement real-time updates for actions similar to tasks
  const handleRealtimeUpdate = useCallback(async () => {
    try {
      const response = await fetch(`/api/actions/${numericActionId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload: { action: HydratedAction | null } = await response.json();
      if (payload.action) {
        updateAction(payload.action);
      }
    } catch (error) {
      console.error(
        "[ActionModal] Failed to refresh action from real-time update",
        error
      );
    }
  }, [updateAction, numericActionId]);

  // TODO: Set up real-time subscription for action
  // useActionRealtime(numericActionId, handleRealtimeUpdate);

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

  const isEventStarted = useMemo(() => {
    if (!eventForConfiguration?.date || !eventForConfiguration?.startTime) return false;

    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    if (eventForConfiguration.date !== today) return false;

    const eventStart = new Date(
      `${eventForConfiguration.date}T${eventForConfiguration.startTime}`
    );

    return now >= eventStart;
  }, [eventForConfiguration?.date, eventForConfiguration?.startTime]);

  const handleUpdate = useCallback(
    async (updates: Partial<EventAVConfigRow>) => {
      if (!eventForConfiguration?.id) return;

      try {
        const response = await fetch(`/api/events/${eventForConfiguration.id}/av-config`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Failed to update AV configuration");
        }

        router.refresh();
      } catch (error) {
        console.error("[ActionContent] Failed to update AV config", error);
        throw error;
      }
    },
    [eventForConfiguration?.id, router]
  );

  const roomName = action.eventDetails?.roomName ?? action.room;

  return (
    <>
      <ActionHeader action={action} errorMessage={errorMessage} />

      <CardContent className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-6 pt-0">
        <ActionDetails action={action} />

        {isConfigAction && eventForConfiguration && (
          <div className="flex flex-wrap gap-3 md:gap-4">
            {eventForConfiguration.avConfig && (
              <Card className="flex-[2] min-w-[340px] basis-[460px] grow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AV Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AvConfiguration
                    avConfig={eventForConfiguration.avConfig}
                    roomName={roomName}
                    editable={isEventStarted}
                    onUpdate={handleUpdate}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="flex-1 min-w-[260px] basis-[320px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Other Hardware</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {eventForConfiguration.otherHardware &&
                eventForConfiguration.otherHardware.length > 0 ? (
                  <div className="space-y-1 text-sm leading-normal">
                    {eventForConfiguration.otherHardware.map((hw, index) => {
                      const hardwareName =
                        typeof hw.otherHardwareDict === "string"
                          ? hw.otherHardwareDict
                          : typeof hw.otherHardwareDict === "object" &&
                            hw.otherHardwareDict !== null
                          ? (hw.otherHardwareDict as { id: string }).id
                          : String(hw.otherHardwareDict);
                      return (
                        <div key={index}>
                          {hardwareName}
                          {hw.quantity && hw.quantity > 1 && ` (${hw.quantity})`}
                          {hw.instructions && (
                            <span className="block text-xs text-muted-foreground mt-0.5">
                              {hw.instructions}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No other hardware</span>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {isCaptureAction && eventForConfiguration && (
          <div className="flex flex-wrap gap-3 md:gap-4">
            <div className="flex-1 min-w-[260px] basis-[320px]">
              <HybridConfiguration hybrid={eventForConfiguration.hybrid} />
            </div>

            <div className="flex-1 min-w-[260px] basis-[320px]">
              <RecordingConfiguration recording={eventForConfiguration.recording} />
            </div>

            {eventForConfiguration.avConfig && (
              <Card className="flex-[2] min-w-[340px] basis-[460px] grow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AV Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AvConfiguration
                    avConfig={eventForConfiguration.avConfig}
                    roomName={roomName}
                    editable={isEventStarted}
                    onUpdate={handleUpdate}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {isStaffAssistAction && eventForConfiguration && (
          <div className="flex flex-wrap gap-3 md:gap-4">
            <div className="flex-1 min-w-[260px] basis-[320px]">
              <HybridConfiguration hybrid={eventForConfiguration.hybrid} />
            </div>

            {eventForConfiguration.avConfig && (
              <Card className="flex-[2] min-w-[340px] basis-[460px] grow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AV Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AvConfiguration
                    avConfig={eventForConfiguration.avConfig}
                    roomName={roomName}
                    editable={isEventStarted}
                    onUpdate={handleUpdate}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Always show QC items section for all actions */}
        <CaptureQC
          task={
            {
              ...action,
              // Adapt action structure to match what CaptureQC expects
              // CaptureQC expects task.captureQcDetails.qcItems where each item has a 'qc' field
              captureQcDetails: hasQcItems
                ? {
                    qcItems: action.qcItems.map((item) => ({
                      ...item,
                      qc: action.id, // Use action ID as qc reference (CaptureQC expects item.qc)
                      qcItemDict: item.qcItemDict ?? {
                        id: 0,
                        displayName: "",
                        instruction: "",
                        createdAt: "",
                        icon: null,
                      },
                    })),
                  }
                : null,
            } as any
          }
        />
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
