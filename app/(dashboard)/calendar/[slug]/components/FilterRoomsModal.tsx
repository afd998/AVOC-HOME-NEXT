import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../../components/ui/dialog";
import { Button } from "../../../../../components/ui/button";
import { ModalCloseButton } from "@/app/(dashboard)/sidebar/filter-dialog-client";
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemActions,
  ItemSeparator,
} from "../../../../../components/ui/item";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getFilters } from "@/lib/data/filters";
import getMyProfile, { saveMyProfile } from "@/lib/data/profile";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { profiles } from "@/drizzle/schema";

type Profile = typeof profiles.$inferSelect;

async function FilterRoomsModal({ profile }: { profile: Profile }) {

  const { currentFilter, autoHide } = profile;
  const filters = await getFilters();

  async function selectFilter(filterName?: string) {
    "use server";
    await saveMyProfile({ currentFilter: filterName ?? undefined });
  }

  async function selectMyEvents() {
    "use server";
    await saveMyProfile({ currentFilter: "My Events" });
  }

  async function toggleAutoHide() {
    "use server";
    await saveMyProfile({ autoHide: !autoHide });
  }

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

  return (
    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Filter Events</DialogTitle>
      </DialogHeader>

      <div className="py-4">
        <div className="space-y-4">
          <ItemGroup className="max-h-80 overflow-y-auto">
            <Item className="p-0">
              <form action={selectMyEvents} className="w-full">
                <Button
                  type="submit"
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 px-4 py-3 text-left",
                    currentFilter === "My Events"
                      ? "bg-accent/50"
                      : "hover:bg-accent/50"
                  )}
                >
                  {renderCheckIcon(currentFilter === "My Events")}
                  <ItemContent>
                    <ItemTitle>My Events</ItemTitle>
                    <ItemDescription>
                      Show only events assigned to me
                    </ItemDescription>
                  </ItemContent>
                </Button>
              </form>
            </Item>

            {filters.map((filter, index) => {
              const filterName = filter.name ?? undefined;
              const isActive = currentFilter === filterName;

              return (
                <React.Fragment key={filter.id}>
                  {index > 0 && <ItemSeparator />}
                  <Item className="flex items-center gap-4 p-4">
                    <form
                      action={selectFilter.bind(null, filterName)}
                      className="flex-1"
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        className={cn(
                          "flex w-full items-start justify-start gap-4 px-0 py-0 text-left",
                          isActive
                            ? "bg-accent/50"
                            : "hover:bg-accent/30 focus:bg-accent/30"
                        )}
                      >
                        {renderCheckIcon(isActive)}
                        <ItemContent>
                          <ItemTitle>{filter.name}</ItemTitle>
                          <ItemDescription>
                            {filter.display.length} rooms
                          </ItemDescription>
                        </ItemContent>
                      </Button>
                    </form>

                    {filter.name?.toLowerCase() === "all rooms" && (
                      <form
                        action={toggleAutoHide}
                        className="flex items-center"
                      >
                        <ItemActions className="flex items-center gap-2">
                          <Label
                            htmlFor={`auto-hide-${filter.id}`}
                            className="text-xs"
                          >
                            Hide empty
                          </Label>
                          <Switch
                            id={`auto-hide-${filter.id}`}
                            type="submit"
                            checked={autoHide}
                            readOnly
                          />
                        </ItemActions>
                      </form>
                    )}
                  </Item>
                </React.Fragment>
              );
            })}
          </ItemGroup>
        </div>
      </div>

      <DialogFooter>
        <ModalCloseButton />
      </DialogFooter>
    </DialogContent>
  );
}

export default FilterRoomsModal;
