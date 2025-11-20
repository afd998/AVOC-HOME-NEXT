import { Badge } from "@/components/ui/badge";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { getActionIcon } from "./utils/getActionIcon";
import { getStatusVariant } from "./utils/getStatusVariant";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import {
  formatDate as formatActionDate,
  formatTime as formatActionTime,
} from "@/app/utils/dateTime";

interface ActionHeaderProps {
  action: HydratedAction;
  errorMessage?: string | null;
}

export default function ActionHeader({ action, errorMessage }: ActionHeaderProps) {
  const iconName = getActionIcon(action);
  const displayName = action.subType?.trim() || action.type?.trim() || "Action";
  const actionDate = action.eventDetails?.date ?? "";
  const formattedDate = formatActionDate(actionDate);
  const formattedTime = formatActionTime(action.startTime);
  const formattedStatus = action.status.trim() || "No status set";
  const hasStatus = action.status.trim().length > 0;
  const statusVariant = getStatusVariant(action.status);

  return (
    <CardHeader className="gap-4 shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-background">
            <Icon
              icon={iconName}
              width={48}
              height={48}
              className="h-12 w-12 p-3 text-muted-foreground"
            />
          </span>
          <div className="flex flex-col gap-1 text-left">
            <CardTitle className="text-xl font-semibold">
              {displayName}
            </CardTitle>
            <CardDescription>
              {formattedDate} | {formattedTime}
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

