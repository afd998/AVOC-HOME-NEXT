"use client";

import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

export default function CalendarButton() {
  return (
    <button
      onClick={() => {
        // Trigger sidebar expansion by removing the collapsed state
        const sidebarElement = document.querySelector(
          '[data-sidebar="sidebar"]'
        );
        if (sidebarElement) {
          sidebarElement.removeAttribute("data-state");
          // Also trigger the sidebar toggle if there's a toggle button
          const toggleButton = document.querySelector(
            '[data-sidebar="trigger"]'
          );
          if (toggleButton) {
            (toggleButton as HTMLElement).click();
          }
        }
      }}
      className="group-data-[collapsible=icon]:flex hidden w-full h-8 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-center"
      aria-label="Open calendar"
    >
      <CalendarIcon className="h-4 w-4" />
    </button>
  );
}
