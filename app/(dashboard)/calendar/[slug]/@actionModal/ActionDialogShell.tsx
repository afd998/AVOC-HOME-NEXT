"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { ReactNode } from "react";

interface ActionDialogShellProps {
  children: ReactNode;
}

export default function ActionDialogShell({ children }: ActionDialogShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Only open if we're actually on an action route
  const isActionRoute = pathname?.includes("/actions/");
  const isEventModalRoute = pathname?.includes("/events/") && !pathname?.includes("/actions/");
  
  // Close action modal when event modal is active (but allow actions nested under events)
  const shouldBeOpen = isActionRoute && !isEventModalRoute;

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

