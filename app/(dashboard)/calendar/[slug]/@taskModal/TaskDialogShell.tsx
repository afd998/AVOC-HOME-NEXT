"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { ReactNode } from "react";

interface TaskDialogShellProps {
  children: ReactNode;
}

export default function TaskDialogShell({ children }: TaskDialogShellProps) {
  const router = useRouter();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        router.back();
      }
    },
    [router]
  );

  return (
    <Dialog defaultOpen open modal onOpenChange={handleOpenChange}>
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
