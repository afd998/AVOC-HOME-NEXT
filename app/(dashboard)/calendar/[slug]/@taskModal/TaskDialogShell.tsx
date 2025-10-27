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
        title="Task"
        className="max-w-3xl w-[min(90vw,56rem)]"
        showCloseButton
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
