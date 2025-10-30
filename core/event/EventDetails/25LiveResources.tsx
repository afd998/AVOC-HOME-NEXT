import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ResourceIcon } from "@/core/event/resourceIcon";
import type { CalendarEventResource } from "@/lib/data/calendar/event/utils/hydrate-event-resources";

export interface TwentyFiveLiveResourcesProps {
  resources?: CalendarEventResource[];
  className?: string;
  avLabel?: string;
  generalLabel?: string;
  emptyAvMessage?: string;
  emptyGeneralMessage?: string;
}

function ResourceSection({
  items,
  emptyMessage,
}: {
  items: CalendarEventResource[];
  emptyMessage: string;
}) {
  if (!items.length) {
    return (
      <div className="py-4 text-sm text-muted-foreground">{emptyMessage}</div>
    );
  }

  return (
    <ItemGroup>
      {items.map((item, index) => (
        <Popover key={`${item.id}-${index}`}>
          <PopoverTrigger asChild>
            <Item
              size="sm"
              className="flex-nowrap cursor-pointer transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <ItemMedia>
                <ResourceIcon icon={item.icon} />
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle>{item.displayName}</ItemTitle>
                <div className="text-xs font-medium text-muted-foreground">
                  {item.id}
                </div>
                {item.instruction && (
                  <ItemDescription className="line-clamp-1 truncate">
                    {item.instruction}
                  </ItemDescription>
                )}
              </ItemContent>
              {item.quantity && item.quantity > 1 && (
                <ItemActions>
                  <Badge variant="default" className="px-2 py-0.5 text-[10px]">
                    ×{item.quantity}
                  </Badge>
                </ItemActions>
              )}
            </Item>
          </PopoverTrigger>
          <PopoverContent align="start" className="max-w-sm space-y-3 text-sm">
            <div className="space-y-2">
              <div className="text-sm font-semibold leading-tight">
                {item.displayName}
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                {item.id}
              </div>
              {item.quantity && item.quantity > 1 && (
                <Badge variant="outline" className="px-2 py-0.5 text-[10px]">
                  Quantity: {item.quantity}
                </Badge>
              )}
            </div>
            <div className="whitespace-pre-wrap text-muted-foreground">
              {item.instruction ?? "No additional instructions provided."}
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </ItemGroup>
  );
}

const TwentyFiveLiveResources: React.FC<TwentyFiveLiveResourcesProps> = ({
  resources,
  className,
  avLabel = "AV Resources",
  generalLabel = "General Resources",
  emptyAvMessage = "No AV resources available.",
  emptyGeneralMessage = "No general resources available.",
}) => {
  if (!resources || resources.length === 0) {
    return null;
  }

  const avResources = resources.filter((resource) => resource.isAVResource);
  const otherResources = resources.filter((resource) => !resource.isAVResource);
  const hasAV = avResources.length > 0;
  const hasGeneral = otherResources.length > 0;
  const defaultTab = hasAV ? "av" : "general";
  const triggerCount = Number(hasAV) + Number(hasGeneral);
  const listColumnClass = triggerCount > 1 ? "grid-cols-2" : "grid-cols-1";

  return (
    <Tabs defaultValue={defaultTab} className={cn("w-full", className)}>
      <TabsList
        className={cn("grid gap-2 bg-transparent p-0", listColumnClass)}
      >
        {hasAV && (
          <TabsTrigger
            value="av"
            className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-primary/10"
          >
            {avLabel}
            <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
              {avResources.length}
            </Badge>
          </TabsTrigger>
        )}
        {hasGeneral && (
          <TabsTrigger
            value="general"
            className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-primary/10"
          >
            {generalLabel}
            <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
              {otherResources.length}
            </Badge>
          </TabsTrigger>
        )}
      </TabsList>

      {hasAV && (
        <TabsContent
          value="av"
          className="mt-4 space-y-2 focus-visible:outline-none"
        >
          <ResourceSection items={avResources} emptyMessage={emptyAvMessage} />
        </TabsContent>
      )}

      {hasGeneral && (
        <TabsContent
          value="general"
          className="mt-4 space-y-2 focus-visible:outline-none"
        >
          <ResourceSection
            items={otherResources}
            emptyMessage={emptyGeneralMessage}
          />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default TwentyFiveLiveResources;
