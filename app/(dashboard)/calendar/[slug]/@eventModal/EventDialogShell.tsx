"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { ReactNode } from "react";

interface EventDialogShellProps {
  children: ReactNode;
}

export default function EventDialogShell({ children }: EventDialogShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Only open if we're actually on an event route
  const isEventRoute = pathname?.includes("/events/");
  const shouldBeOpen = isEventRoute;

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
        className="max-w-5xl w-[min(95vw,72rem)]"
        showCloseButton
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
