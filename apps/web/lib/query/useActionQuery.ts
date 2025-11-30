"use client";

import { useQuery } from "@tanstack/react-query";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

export const actionQueryKey = (actionId: string) => ["action", actionId] as const;

type ActionResponse = {
  action: HydratedAction;
};

async function fetchAction(actionId: string): Promise<HydratedAction> {
  const response = await fetch(`/api/actions/${actionId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Action not found");
    }
    throw new Error("Failed to fetch action");
  }

  const data: ActionResponse = await response.json();
  return data.action;
}

type UseActionQueryOptions = {
  actionId: string;
};

export function useActionQuery({ actionId }: UseActionQueryOptions) {
  return useQuery({
    queryKey: actionQueryKey(actionId),
    queryFn: () => fetchAction(actionId),
    enabled: Boolean(actionId),
  });
}

