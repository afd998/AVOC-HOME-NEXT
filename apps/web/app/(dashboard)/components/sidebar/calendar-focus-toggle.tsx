"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import { useCalendarLayoutStore } from "@/lib/stores/calendar-layout";
import { cn } from "@/lib/utils";

import { useSidebar } from "./sidebar-shell";

type CalendarFocusToggleProps = {
  className?: string;
};

export function CalendarFocusToggle({ className }: CalendarFocusToggleProps) {
  const pathname = usePathname();
  const isCalendarRoute = pathname?.startsWith("/calendar");
  const { actionPanelVisible, setActionPanelVisible } =
    useCalendarLayoutStore();
  const { open, openMobile, setOpen, setOpenMobile } = useSidebar();
  const [previousSidebarState, setPreviousSidebarState] = useState<{
    desktop: boolean;
    mobile: boolean;
  } | null>(null);

  if (!isCalendarRoute) {
    return null;
  }

  const handleToggle = () => {
    if (actionPanelVisible) {
      setPreviousSidebarState({ desktop: open, mobile: openMobile });
      setActionPanelVisible(false);
      setOpen(false);
      setOpenMobile(false);
      return;
    }

    setActionPanelVisible(true);
    setOpen(previousSidebarState?.desktop ?? true);
    setOpenMobile(previousSidebarState?.mobile ?? false);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-pressed={!actionPanelVisible}
      aria-label={
        actionPanelVisible
          ? "Collapse sidebar and hide action panel"
          : "Restore sidebar and show action panel"
      }
      className={cn(
        "h-8 w-8",
        !actionPanelVisible && "bg-muted text-foreground",
        className
      )}
    >
      <Icon
        icon="ant-design:expand-outlined"
        className={cn(
          "h-4 w-4 transition-transform",
          !actionPanelVisible && "rotate-180"
        )}
      />
    </Button>
  );
}
