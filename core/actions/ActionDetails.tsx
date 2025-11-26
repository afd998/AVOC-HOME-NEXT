import type { ReactNode } from "react";
import Link from "next/link";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";
import {
  formatDate as formatActionDate,
  formatTime as formatActionTime,
} from "@/app/utils/dateTime";

interface ActionDetailsProps {
  action: HydratedAction;
}

export default function ActionDetails({ action }: ActionDetailsProps) {
  const actionDetails: Array<{
    label: string;
    value: ReactNode;
    href?: string;
  }> = [{ label: "Venue", value: (action.room || "").replace(/^GH\s+/i, "") }];

  if (action.eventDetails) {
    const details = action.eventDetails;
    const eventTitle = details.eventName.trim() || "Linked Event";
    const dateLabel = formatActionDate(details.date);
    const startLabel = details.startTime
      ? formatActionTime(details.startTime)
      : null;
    const endLabel = details.endTime ? formatActionTime(details.endTime) : null;
    const eventTimingLabel =
      startLabel && endLabel
        ? `${dateLabel} · ${startLabel} - ${endLabel}`
        : null;

    const eventLink = `/events/${details.id}`;

    actionDetails.push({
      label: "Event",
      value: (
        <>
          <span className="font-medium text-foreground">{eventTitle}</span>
          {eventTimingLabel ? (
            <span className="block text-xs text-muted-foreground">
              {eventTimingLabel}
            </span>
          ) : null}
        </>
      ),
      href: eventLink,
    });
  }

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase text-muted-foreground">
        Action Details
      </h3>
      <ItemGroup className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        {actionDetails.map(({ label, value, href }) => {
          const content = (
            <ItemContent className="flex flex-col gap-1">
              <ItemTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </ItemTitle>
              <ItemDescription className="text-sm font-medium text-foreground">
                {value}
              </ItemDescription>
            </ItemContent>
          );

          if (href) {
            return (
              <Item
                key={label}
                variant="outline"
                size="sm"
                className="flex w-full flex-col gap-2"
                asChild
              >
                <Link href={href}>{content}</Link>
              </Item>
            );
          }

          return (
            <Item
              key={label}
              variant="outline"
              size="sm"
              className="flex w-full flex-col gap-2"
            >
              {content}
            </Item>
          );
        })}
      </ItemGroup>
    </section>
  );
}

