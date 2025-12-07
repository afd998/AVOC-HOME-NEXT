"use client";

import React, { Fragment, useCallback, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "../../../../../components/ui/item";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { type RoomFilter } from "shared/db/types";
import { useModal } from "@/app/(dashboard)/components/sidebar/filter-dialog-client";

type FilterRoomsModalContentProps = {
  filters: RoomFilter[];
};

const DEFAULT_FILTER = "All Rooms";

export default function FilterRoomsModalContent({
  filters,
}: FilterRoomsModalContentProps) {
  const { close } = useModal();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const currentFilter = searchParams.get("filter") ?? DEFAULT_FILTER;
  const autoHideParam = searchParams.get("autoHide");
  const autoHide = autoHideParam === "true" || autoHideParam === "1";

  const createHref = useCallback(
    (filterName?: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (filterName && filterName.length > 0) {
        params.set("filter", filterName);
      } else {
        params.delete("filter");
      }

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  const renderCheckIcon = (isActive: boolean) => (
    <ItemMedia>
      <Check
        className={cn(
          "h-4 w-4 transition-opacity",
          isActive ? "text-primary opacity-100" : "opacity-0"
        )}
      />
    </ItemMedia>
  );

  const handleSelect = () => {
    close();
  };

  const toggleAutoHide = useCallback(
    (checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());

      if (checked) {
        params.set("autoHide", "true");
      } else {
        params.delete("autoHide");
      }

      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams, startTransition]
  );

  const getRoomCount = useCallback((filter: RoomFilter) => {
    const names = new Set<string>();
    (filter.venueFilterVenues ?? []).forEach((relation) => {
      const venueName =
        typeof relation?.venue?.name === "string"
          ? relation.venue.name.trim()
          : "";

      if (venueName) {
        names.add(venueName);
      }
    });

    return names.size;
  }, []);

  return (
    <ItemGroup className="max-h-80 overflow-y-auto">
      {filters.map((filter, index) => {
        const filterName = filter.name ?? undefined;
        const displayName = filterName ?? DEFAULT_FILTER;
        const isActive = currentFilter === displayName;
        const href = createHref(filterName);

        return (
          <Fragment key={filter.id}>
            {index > 0 && <ItemSeparator />}
            <Item className="flex items-center gap-4 p-4">
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "flex w-full items-start justify-start gap-4 px-0 py-0 text-left",
                  isActive
                    ? "bg-accent/50"
                    : "hover:bg-accent/30 focus:bg-accent/30"
                )}
              >
                <Link href={href} onClick={handleSelect}>
                  {renderCheckIcon(isActive)}
                  <ItemContent>
                    <ItemTitle>{displayName}</ItemTitle>
                    <ItemDescription>
                      {getRoomCount(filter)} rooms
                    </ItemDescription>
                  </ItemContent>
                </Link>
              </Button>
            </Item>
          </Fragment>
        );
      })}

      {filters.length > 0 && <ItemSeparator />}

      <Item className="flex items-center justify-between gap-4 p-4">
        <ItemContent>
          <ItemTitle>Hide empty rooms</ItemTitle>
          <ItemDescription>
            Remove rooms without events from the list
          </ItemDescription>
        </ItemContent>
        <Switch
          id="auto-hide-toggle"
          checked={autoHide}
          onCheckedChange={toggleAutoHide}
          aria-label="Toggle hide empty rooms"
        />
      </Item>
    </ItemGroup>
  );
}
