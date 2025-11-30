"use client";

import { useQuery } from "@tanstack/react-query";
import type { ShiftRow, ShiftBlockRow, ProfileRow } from "@/lib/data/assignments";

// Query keys
export const shiftsQueryKey = (date: string) => ["shifts", date] as const;
export const shiftBlocksQueryKey = (date: string) => ["shift_blocks", date] as const;
export const profilesQueryKey = () => ["profiles"] as const;

// API response types
type ShiftsResponse = {
  shifts: ShiftRow[];
};

type ShiftBlocksResponse = {
  shiftBlocks: ShiftBlockRow[];
};

type ProfilesResponse = {
  profiles: ProfileRow[];
};

// Fetch functions
async function fetchShifts(date: string): Promise<ShiftRow[]> {
  const response = await fetch(`/api/assignments/shifts?date=${encodeURIComponent(date)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch shifts");
  }
  const data: ShiftsResponse = await response.json();
  return data.shifts;
}

async function fetchShiftBlocks(date: string): Promise<ShiftBlockRow[]> {
  const response = await fetch(`/api/assignments/shift-blocks?date=${encodeURIComponent(date)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch shift blocks");
  }
  const data: ShiftBlocksResponse = await response.json();
  return data.shiftBlocks;
}

async function fetchProfiles(): Promise<ProfileRow[]> {
  const response = await fetch(`/api/assignments/profiles`);
  if (!response.ok) {
    throw new Error("Failed to fetch profiles");
  }
  const data: ProfilesResponse = await response.json();
  return data.profiles;
}

// Hooks
export function useShiftsQuery(date: string) {
  return useQuery({
    queryKey: shiftsQueryKey(date),
    queryFn: () => fetchShifts(date),
    enabled: !!date,
  });
}

export function useShiftBlocksQuery(date: string) {
  return useQuery({
    queryKey: shiftBlocksQueryKey(date),
    queryFn: () => fetchShiftBlocks(date),
    staleTime: Infinity, // Data never becomes stale - only invalidated on mutations
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!date,
  });
}

export function useProfilesQuery() {
  return useQuery({
    queryKey: profilesQueryKey(),
    queryFn: fetchProfiles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

