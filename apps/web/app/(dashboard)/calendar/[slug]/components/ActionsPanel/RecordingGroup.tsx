import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Icon } from "@iconify/react";

import ActionRow from "./ActionRow";
import { convertTimeToMinutes } from "./utils";
import type { RecordingGroupItem } from "./types";
import { actionOverdueClassName } from "./actionOverdueStyles";
import { getActionIconConfig } from "@/core/actions/utils/getActionIcon";

type RecordingGroupProps = {
  group: RecordingGroupItem;
  hideAssignedAvatar?: boolean;
};

export default function RecordingGroup({
  group,
  hideAssignedAvatar = false,
}: RecordingGroupProps) {
  const { actions, groupKey } = group;

  const title = "Capture QC";
  const iconConfig = actions[0]?.action
    ? getActionIconConfig(actions[0].action)
    : { icon: "jam:eye-f", colorClass: "text-purple-600" };
  const completedCount = actions.reduce((count, { action }) => {
    const normalizedStatus = action.status?.trim().toLowerCase();
    return normalizedStatus === "completed" ? count + 1 : count;
  }, 0);
  const isAllCompleted = actions.length > 0 && completedCount === actions.length;
  const checkCountLabel =
    actions.length === 0
      ? "No checks"
      : `${completedCount}/${actions.length} completed`;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayIso = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const hasOverdueAction = actions.some(({ action }) => {
    const normalizedStatus = action.status?.trim().toLowerCase();
    if (normalizedStatus === "completed") return false;
    const actionDate = action.eventDetails?.date;
    if (actionDate !== todayIso) return false;
    const startMinutes = convertTimeToMinutes(action.startTime);
    if (startMinutes === null) return false;
    return startMinutes <= nowMinutes;
  });

  return (
    <Collapsible className="w-full">
      <Item
        variant="outline"
        size="sm"
        className={cn(
          "flex flex-col gap-0 p-0",
          hasOverdueAction && [
            "border-rose-200 bg-rose-100/70 dark:border-rose-900 dark:bg-rose-950/40",
            actionOverdueClassName,
          ],
          isAllCompleted &&
            "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/60",
          !hasOverdueAction && !isAllCompleted && "bg-card"
        )}
      >
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]>svg]:rotate-180",
            hasOverdueAction
              ? "hover:bg-rose-200 dark:hover:bg-rose-900/70"
              : isAllCompleted
                ? "hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                : "hover:bg-muted/70 dark:hover:bg-muted/40"
          )}
        >
          <ItemMedia
            variant="default"
            className={cn(
              "mt-1",
              isAllCompleted ? "text-emerald-600" : "text-muted-foreground"
            )}
          >
            <div className="flex items-center justify-center w-full h-full rounded-full border bg-muted/50">
              <Icon
                icon={iconConfig.icon}
                width={16}
                height={16}
                className={cn("w-4 h-4", iconConfig.colorClass)}
              />
            </div>
          </ItemMedia>
          <ItemContent className="flex flex-1 flex-col gap-1">
            <ItemTitle className="text-sm font-medium leading-tight">
              {title}
            </ItemTitle>
            <ItemDescription className="text-xs text-muted-foreground">
              {checkCountLabel}
            </ItemDescription>
          </ItemContent>
          <ChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground transition-transform" />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t px-3 pb-3 pt-2">
          <ItemGroup className="gap-2">
            {actions.map((entry) => (
              <ActionRow
                key={`${groupKey}-${entry.action.id}`}
                entry={entry}
                hideAssignedAvatar={hideAssignedAvatar}
              />
            ))}
          </ItemGroup>
        </CollapsibleContent>
      </Item>
    </Collapsible>
  );
}
