"use client";

import type { ActionWithDict } from "@/lib/data/actions/actions";
import { Badge } from "@/components/ui/badge";
import { getProfileDisplayName } from "@/core/User/utils";
import { formatTime } from "@/app/utils/dateTime";
import { Icon } from "@iconify/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface EventActionTimelineItemProps {
  action: ActionWithDict;
}

// Simple icon mapping for action types
function getActionIcon(type: string | null, subType: string | null) {
  const typeUpper = type?.toUpperCase() || "";
  const subTypeUpper = subType?.toUpperCase() || "";
  
  if (typeUpper.includes("CONFIG") || subTypeUpper.includes("CONFIG")) {
    return "mdi:cog";
  }
  if (typeUpper.includes("CAPTURE") || subTypeUpper.includes("CAPTURE") || typeUpper.includes("RECORDING")) {
    return "mdi:video";
  }
  if (typeUpper.includes("STAFF") || subTypeUpper.includes("STAFF") || typeUpper.includes("ASSISTANCE")) {
    return "mdi:account-group";
  }
  
  return "mdi:check-circle";
}

function getStatusVariant(status: string) {
  const normalizedStatus = status.trim().toLowerCase();
  switch (normalizedStatus) {
    case "completed":
      return "affirmative";
    case "cancelled":
    case "canceled":
      return "destructive";
    case "in progress":
    case "processing":
      return "secondary";
    default:
      return "outline";
  }
}

function getActionDisplayName(type: string | null, subType: string | null): string {
  return subType?.trim() || type?.trim() || "Action";
}

export default function EventActionTimelineItem({ action }: EventActionTimelineItemProps) {
  const iconName = getActionIcon(action.type, action.subType);
  const statusVariant = getStatusVariant(action.status);
  const displayName = getActionDisplayName(action.type, action.subType);
  const assignedToName = getProfileDisplayName(action.assignedToProfile);
  const completedByName = getProfileDisplayName(action.completedByProfile);
  const formattedTime = action.startTime ? formatTime(action.startTime) : "";
  const actionLink = `/actions/${action.id}`;

  return (
    <Link href={actionLink} className="relative flex items-start gap-4 hover:opacity-80 transition-opacity cursor-pointer">
      {/* Source */}
      {action.source && (
        <>
          <div className="relative z-10 flex items-center">
            <Badge variant="outline" className="text-xs px-2 py-1">
              {action.source}
            </Badge>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1.5" />
        </>
      )}
      
      {/* Timeline dot with connecting line */}
      <div className="relative flex flex-col items-center">
        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary">
          <Icon icon={iconName} className="h-4 w-4 text-primary-foreground" />
        </div>
        {/* Vertical line extending down */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 bg-border h-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight">
                {displayName}
              </h4>
              {formattedTime && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formattedTime}
                </p>
              )}
            </div>
            <Badge variant={statusVariant} className="shrink-0 text-xs px-2 py-0.5">
              {action.status || "Pending"}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-1 text-xs text-muted-foreground">
            {assignedToName && (
              <div>
                <span className="font-medium">Assigned to:</span> {assignedToName}
              </div>
            )}
            {completedByName && (
              <div>
                <span className="font-medium">Completed by:</span> {completedByName}
              </div>
            )}
            {action.completedTime && (
              <div>
                <span className="font-medium">Completed at:</span>{" "}
                {new Date(action.completedTime).toLocaleString()}
              </div>
            )}
          </div>

          {/* QC Items */}
          {action.qcItems && action.qcItems.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="text-xs font-medium text-muted-foreground">QC Items:</div>
              <div className="space-y-1">
                {action.qcItems.map((qcItem, qcIndex) => (
                  <div
                    key={qcIndex}
                    className="text-xs text-muted-foreground pl-2 border-l-2 border-muted"
                  >
                    {qcItem.qcItemDict?.instruction || "QC Item"}
                    {qcItem.status && (
                      <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 flex items-center gap-1">
                        {qcItem.status === "pass" ? (
                          <Icon icon="mdi:check" width={12} height={12} />
                        ) : qcItem.status === "fail" ? (
                          <Icon icon="mdi:close" width={12} height={12} />
                        ) : (
                          qcItem.status
                        )}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

