"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { ReactNode } from "react";

interface TaskDialogShellProps {
  children: ReactNode;
}

export default function TaskDialogShell({ children }: TaskDialogShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Only open if we're actually on a task route
  const isTaskRoute = pathname?.includes("/tasks/");
  const isEventRoute = pathname?.includes("/events/");
  
  // Close task modal when event modal is active
  const shouldBeOpen = isTaskRoute && !isEventRoute;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        router.back();
      }
    },
    [router]
  );

  return (
    <Dialog defaultOpen open={shouldBeOpen} modal={shouldBeOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[min(90vw,56rem)] max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0"
        showCloseButton
      >
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col h-full">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
