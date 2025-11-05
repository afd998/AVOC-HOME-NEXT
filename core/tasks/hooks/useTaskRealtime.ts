import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

let sharedSupabaseClient: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!sharedSupabaseClient) {
    sharedSupabaseClient = createClient();
  }
  return sharedSupabaseClient;
};

/**
 * Hook to subscribe to real-time updates for a specific task
 * @param taskId - The numeric task ID to subscribe to
 * @param onUpdate - Callback function called when the task is updated in the database, receives the updated task data
 */
export function useTaskRealtime(
  taskId: number,
  onUpdate: (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => void
) {
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`task-modal:${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `id=eq.${taskId}`,
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, onUpdate]);
}

/**
 * Hook to subscribe to real-time updates for QC items for a specific task
 * @param taskId - The numeric task ID (qc value) to subscribe to
 * @param onUpdate - Callback function called when QC items are updated, triggers a task refresh
 */
export function useCaptureQCRealtime(
  taskId: number,
  onUpdate: () => void
) {
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`qc-items:${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "qc_items",
          filter: `qc=eq.${taskId}`,
        },
        () => {
          // When QC items change, trigger a refresh
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, onUpdate]);
}

