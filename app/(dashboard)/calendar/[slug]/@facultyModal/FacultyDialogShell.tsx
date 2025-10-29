"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { ReactNode } from "react";

interface FacultyDialogShellProps {
  children: ReactNode;
}

export default function FacultyDialogShell({ children }: FacultyDialogShellProps) {
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
        className=" px-1 py-5 w-[50vw] max-w-[90vw] max-h-[85vh] overflow-hidden rounded-xl border border-border  shadow-2xl flex flex-col"
        showCloseButton
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
