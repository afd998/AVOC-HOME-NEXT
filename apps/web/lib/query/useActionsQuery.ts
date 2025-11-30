"use client";

import { useQuery } from "@tanstack/react-query";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

export type ActionGroup = {
  roomName: string;
  actions: HydratedAction[];
};

export const actionPanelQueryKey = (
  date: string,
  filter: string,
  autoHide: boolean
) => ["actionpanel", date, filter, autoHide] as const;

type ActionsResponse = {
  actionGroups: ActionGroup[];
};

async function fetchActions(
  date: string,
  filter: string,
  autoHide: boolean
): Promise<ActionGroup[]> {
  const params = new URLSearchParams({
    filter,
    autoHide: autoHide ? "true" : "false",
  });

  const response = await fetch(`/api/calendar/${date}/actions?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch actions");
  }

  const data: ActionsResponse = await response.json();
  return data.actionGroups;
}

type UseActionsQueryOptions = {
  date: string;
  filter: string;
  autoHide: boolean;
};

export function useActionsQuery({
  date,
  filter,
  autoHide,
}: UseActionsQueryOptions) {
  return useQuery({
    queryKey: actionPanelQueryKey(date, filter, autoHide),
    queryFn: () => fetchActions(date, filter, autoHide),
  });
}

