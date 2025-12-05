"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import { actionQueryKey } from "./useActionQuery";
import { useActionMutations } from "./useActionMutations";

type ManualAssigneePayload = {
  actionId: number;
  profileId: string | null;
};

async function updateManualAssignee({
  actionId,
  profileId,
}: ManualAssigneePayload): Promise<HydratedAction> {
  const response = await fetch(`/api/actions/${actionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ assignedToManual: profileId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update manual assignee");
  }

  const data: { action: HydratedAction } = await response.json();
  return data.action;
}

export function useManualActionAssignee() {
  const queryClient = useQueryClient();
  const { updateAction } = useActionMutations();

  return useMutation({
    mutationFn: updateManualAssignee,
    onSuccess: (action) => {
      updateAction(action);
      queryClient.setQueryData(actionQueryKey(String(action.id)), action);
    },
  });
}
