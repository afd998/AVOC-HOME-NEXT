"use client";

import Link from "next/link";
import { useSidebar } from "./sidebar-shell";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FacultyIcon } from "./faculty-icon";

export default function FacultyButton() {
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleClick = () => {
    // If sidebar is collapsed, expand it
    if (state === "collapsed") {
      setOpen(true);
    }
  };

  const button = (
    <Link href="/faculty">
      <button
        onClick={handleClick}
        className="group-data-[collapsible=icon]:flex hidden w-full h-8 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-center cursor-pointer"
        aria-label="Faculty Directory"
      >
        <FacultyIcon className="h-4 w-4" />
      </button>
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={2000}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">
          <p>Faculty Directory</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
