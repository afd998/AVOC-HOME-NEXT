"use client";

import Link from "next/link";
import type { finalEvent } from "@/lib/data/calendar/calendar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  FacultyAvatar,
  getFacultyDisplayName,
} from "@/core/faculty/FacultyAvatar";

type EventFacultyListProps = {
  faculty: finalEvent["faculty"];
};

export function EventFacultyList({ faculty }: EventFacultyListProps) {
  if (!faculty?.length) {
    return null;
  }

  return (
    <ItemGroup>
      {faculty.map((member) => {
        const displayName = getFacultyDisplayName(member) || "View Faculty";
        const subtitle =
          member?.kelloggdirectoryTitle ||
          member?.kelloggdirectorySubtitle ||
          null;

        return (
          <Item
            key={member.id}
            size="sm"
            variant="outline"
            asChild
            className="border-border transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <Link href={`/faculty/${member.id}`} className="flex w-full items-start gap-3 no-underline">
              <ItemMedia className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted">
                <FacultyAvatar
                  instructorName={displayName}
                  imageUrl={
                    member?.kelloggdirectoryImageUrl ||
                    member?.kelloggdirectory_image_url ||
                    member?.imageUrl ||
                    member?.image_url ||
                    undefined
                  }
                  cutoutImageUrl={member?.cutoutImage || member?.cutout_image || undefined}
                  size="md"
                  className="!h-10 !w-10"
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-sm font-medium text-foreground">
                  {displayName}
                </ItemTitle>
                {subtitle ? (
                  <ItemDescription className="text-xs text-muted-foreground">
                    {subtitle}
                  </ItemDescription>
                ) : null}
              </ItemContent>
            </Link>
          </Item>
        );
      })}
    </ItemGroup>
  );
}
