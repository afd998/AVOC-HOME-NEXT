"use client";

import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useSidebar } from "./sidebar-shell";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CalendarButton() {
  const { state, setOpen } = useSidebar();

  const handleClick = () => {
    // If sidebar is collapsed, expand it
    if (state === "collapsed") {
      setOpen(true);
    }
  };

  const button = (
    <button
      onClick={handleClick}
      className="group-data-[collapsible=icon]:flex hidden w-full h-8 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-center cursor-pointer"
      aria-label="Open calendar"
    >
      <CalendarIcon className="h-4 w-4" />
    </button>
  );

  return (
    <Tooltip delayDuration={2000}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">
        <p>Calendar</p>
      </TooltipContent>
    </Tooltip>
  );
}
