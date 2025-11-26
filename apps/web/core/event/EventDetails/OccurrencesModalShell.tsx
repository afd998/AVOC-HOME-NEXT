"use client";

import { type ComponentProps, type ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import {
  formatDate,
  formatTimeFromHHMMSS,
} from "@/lib/utils/timeUtils";

interface OccurrencesModalShellProps {
  event: finalEvent;
  children: ReactNode;
  className?: string;
  itemVariant?: ComponentProps<typeof Item>["variant"];
}

export function OccurrencesModalShell({
  event,
  children,
  className,
  itemVariant = "outline",
}: OccurrencesModalShellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dateLabel = formatDate(event.date);
  const startLabel = formatTimeFromHHMMSS(event.startTime);
  const endLabel = formatTimeFromHHMMSS(event.endTime);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Item
          variant={itemVariant}
          className={cn("cursor-pointer", className)}
        >
          <ItemMedia variant="icon">
            <div className="flex flex-col items-center justify-center">
              <ChevronUp className="h-4 w-4" />
              <ChevronDown className="h-4 w-4" />
            </div>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Occurrences</ItemTitle>
            <ItemDescription>
              {dateLabel}
              {startLabel ? ` | ${startLabel}` : ""}
              {endLabel ? ` - ${endLabel}` : ""}
              <span className="ml-1 text-xs text-muted-foreground">CST</span>
            </ItemDescription>
          </ItemContent>
        </Item>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        {children}
      </DialogContent>
    </Dialog>
  );
}




