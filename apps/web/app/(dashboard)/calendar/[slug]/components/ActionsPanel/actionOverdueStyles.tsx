export const actionOverdueClassName =
  "relative will-change-[box-shadow] shadow-[inset_0_0_0_0_rgba(248,113,113,0.35)] dark:shadow-[inset_0_0_0_0_rgba(248,113,113,0.45)] motion-safe:animate-[action-overdue-pulse_2.6s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:shadow-[inset_0_0_12px_3px_rgba(248,113,113,0.55)]";

export function ActionOverdueKeyframes() {
  return (
    <style jsx global>{`
      @keyframes action-overdue-pulse {
        0%,
        100% {
          box-shadow: inset 0 0 0 0 rgba(248, 113, 113, 0.35);
        }
        50% {
          box-shadow: inset 0 0 16px 4px rgba(248, 113, 113, 0.55);
        }
      }
    `}</style>
  );
}

