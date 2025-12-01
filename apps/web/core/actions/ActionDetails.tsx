import type { ReactNode } from "react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import type { HydratedAction } from "@/lib/data/calendar/actionUtils";

interface ActionDetailsProps {
  action: HydratedAction;
}

export default function ActionDetails({ action }: ActionDetailsProps) {
  const actionDetails: Array<{
    label: string;
    value: ReactNode;
    href?: string;
  }> = [{ label: "Venue", value: (action.room || "").replace(/^GH\s+/i, "") }];

  return (
    <section className="space-y-2">
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
