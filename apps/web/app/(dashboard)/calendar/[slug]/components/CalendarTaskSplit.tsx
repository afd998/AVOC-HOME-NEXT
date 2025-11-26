"use client";

import { type ReactNode, Children } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

type CalendarTaskSplitProps = {
  children: ReactNode;
  className?: string;
};

function extractPanels(children: ReactNode) {
  const panels = Children.toArray(children);
  if (panels.length !== 2) {
    throw new Error(
      "CalendarTaskSplit expects exactly two children: the calendar content and the task view."
    );
  }
  return panels;
}

export default function CalendarTaskSplit({
  children,
  className,
}: CalendarTaskSplitProps) {
  const [calendarPanel, taskPanel] = extractPanels(children);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn("flex h-full rounded-md border bg-background", className)}
    >
      <ResizablePanel
        defaultSize={80}
        minSize={40}
        className="min-w-[32rem]"
      >
        <div className="flex h-full flex-col overflow-hidden">
          {calendarPanel}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle className="bg-border" />
      <ResizablePanel defaultSize={20} minSize={20} className="min-w-[20rem]">
        <div className="flex h-full flex-col overflow-hidden">
          {taskPanel}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
