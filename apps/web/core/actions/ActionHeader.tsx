import { Badge } from "@/components/ui/badge";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { getActionIconConfig } from "./utils/getActionIcon";
import { getStatusVariant } from "./utils/getStatusVariant";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import {
  formatDateNumeric as formatActionDate,
  formatTime as formatActionTime,
} from "@/app/utils/dateTime";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ActionHeaderProps {
  action: HydratedAction;
  errorMessage?: string | null;
}

export default function ActionHeader({ action, errorMessage }: ActionHeaderProps) {
  const { icon: iconName, colorClass: iconColorClass } = getActionIconConfig(action);
  const typeUpper = action.type?.toUpperCase() || "";
  const subTypeUpper = action.subType?.toUpperCase() || "";
  const isConfigAction =
    typeUpper.includes("CONFIG") || subTypeUpper.includes("CONFIG");
  const rawSubType = action.subType?.trim() || "";
  const rawType = action.type?.trim() || "";
  const displayName = isConfigAction
    ? "Configure Space"
    : rawSubType || rawType || "Action";
  const actionDate = action.eventDetails?.date ?? "";
  const formattedDate = formatActionDate(actionDate);
  const formattedTime = formatActionTime(action.startTime);
  const startDateTime =
    actionDate && action.startTime
      ? new Date(`${actionDate}T${action.startTime}`)
      : null;
  const timeUntilStart =
    startDateTime && !Number.isNaN(startDateTime.getTime())
      ? formatDistanceToNow(startDateTime, { addSuffix: true })
      : null;
  const formattedStatus = action.status.trim() || "No status set";
  const hasStatus = action.status.trim().length > 0;
  const statusVariant = getStatusVariant(action.status);
  const venue =
    (action.eventDetails?.roomName ?? action.room ?? "").replace(/^GH\s+/i, "") ||
    "No venue";

  return (
    <CardHeader className="gap-4 shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-background">
            <Icon
              icon={iconName}
              width={48}
              height={48}
              className={cn(
                "h-12 w-12 p-3",
                iconColorClass
              )}
            />
          </span>
          <div className="flex flex-col gap-1 text-left">
            <CardTitle className="text-xl font-semibold">
              {displayName}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Icon icon="lucide:calendar" className="h-4 w-4" />
                <span>{formattedDate}</span>
              </span>
              <span className="text-muted-foreground" aria-hidden="true">
                |
              </span>
              <span className="flex items-center gap-2">
                <Icon icon="lucide:clock-3" className="h-4 w-4" />
                <span>{formattedTime}</span>
                {timeUntilStart ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{timeUntilStart}</span>
                  </>
                ) : null}
              </span>
              <span className="text-muted-foreground" aria-hidden="true">
                |
              </span>
              <span className="flex items-center gap-2">
                <Icon icon="lucide:map-pin" className="h-4 w-4" />
                <span>{venue}</span>
              </span>
            </CardDescription>
          </div>
        </div>
        {hasStatus ? (
          <Badge variant={statusVariant} className="uppercase tracking-wide">
            {formattedStatus}
          </Badge>
        ) : null}
      </div>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </CardHeader>
  );
}
