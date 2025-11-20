"use client";

import { useCallback } from "react";
import { CardContent } from "@/components/ui/card";
import CaptureQC, { useCaptureQCForm } from "@/core/tasks/CaptureQC";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import { useCalendarActionsStore } from "@/app/(dashboard)/calendar/[slug]/stores/useCalendarActionsStore";
import ActionHeader from "./ActionHeader";
import ActionDetails from "./ActionDetails";
import ActionInstructions from "./ActionInstructions";
import ActionAVConfiguration from "./ActionAVConfiguration";
import ActionFooter from "./ActionFooter";
import { useActionCompletion } from "./hooks/useActionCompletion";

type ActionContentProps = {
  action: HydratedAction;
};

export default function ActionContent({
  action: actionProp,
}: ActionContentProps) {
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

  // Extract instructions from resource events
  const resourceEvents = action.eventDetails?.resourceEvents ?? [];
  const instructionEntries = resourceEvents
    .map((resourceEvent) => resourceEvent.instructions?.trim())
    .filter((value): value is string => !!value && value.length > 0);

  // Check if AV config exists
  const avConfig =
    action.eventDetails?.eventAvConfigs && action.eventDetails.eventAvConfigs.length > 0
      ? action.eventDetails.eventAvConfigs[0]
      : null;
  const roomName = action.eventDetails?.roomName ?? action.room;

  return (
    <>
      <ActionHeader action={action} errorMessage={errorMessage} />

      <CardContent className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-6 pt-0">
        <ActionDetails action={action} />

        <ActionInstructions instructions={instructionEntries} />

        {avConfig && action.eventDetails?.id && (
          <ActionAVConfiguration 
            avConfig={avConfig} 
            roomName={roomName}
            eventId={action.eventDetails.id}
            eventDate={action.eventDetails.date}
            eventStartTime={action.eventDetails.startTime}
          />
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
