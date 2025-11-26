"use client";

import Link from "next/link";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  FacultyAvatar,
  getFacultyDisplayName,
  type FacultyAvatarItem,
} from "./FacultyAvatar";

interface FacultyItemProps {
  faculty: FacultyAvatarItem;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "ghost" | "default";
  showSubtitle?: boolean;
  className?: string;
  compact?: boolean;
}

export function FacultyItem({
  faculty,
  size = "sm",
  variant = "outline",
  showSubtitle = true,
  className,
  compact = false,
}: FacultyItemProps) {
  const displayName = getFacultyDisplayName(faculty) || "View Faculty";
  const subtitle =
    showSubtitle &&
    (faculty?.kelloggdirectoryTitle ||
      faculty?.kelloggdirectorySubtitle ||
      null);

  if (compact) {
    // Compact inline version for headers
    const facultyLink = faculty.id ? `/faculty/${faculty.id}` : null;
    
    const content = (
      <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-border bg-background transition-colors hover:border-primary/40 hover:bg-primary/5">
        <FacultyAvatar
          instructorName={displayName}
          imageUrl={
            faculty?.kelloggdirectoryImageUrl ||
            faculty?.kelloggdirectory_image_url ||
            faculty?.imageUrl ||
            faculty?.image_url ||
            undefined
          }
          cutoutImageUrl={faculty?.cutoutImage || faculty?.cutout_image || undefined}
          size="sm"
          className="!h-6 !w-6"
        />
        <span className="text-sm text-foreground">{displayName}</span>
      </div>
    );

    if (!facultyLink) {
      return <div className={className}>{content}</div>;
    }

    return (
      <Link 
        href={facultyLink} 
        className={`inline-flex no-underline cursor-pointer ${className || ""}`}
      >
        {content}
      </Link>
    );
  }

  if (!faculty.id) {
    // If no ID, render without link
    return (
      <Item
        size={size}
        variant={variant}
        className={className}
      >
        <ItemMedia className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted">
          <FacultyAvatar
            instructorName={displayName}
            imageUrl={
              faculty?.kelloggdirectoryImageUrl ||
              faculty?.kelloggdirectory_image_url ||
              faculty?.imageUrl ||
              faculty?.image_url ||
              undefined
            }
            cutoutImageUrl={faculty?.cutoutImage || faculty?.cutout_image || undefined}
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
      </Item>
    );
  }

  return (
    <Item
      size={size}
      variant={variant}
      asChild
      className={`border-border transition-colors hover:border-primary/40 hover:bg-primary/5 ${className || ""}`}
    >
      <Link href={`/faculty/${faculty.id}`} className="flex w-full items-start gap-3 no-underline">
        <ItemMedia className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted">
          <FacultyAvatar
            instructorName={displayName}
            imageUrl={
              faculty?.kelloggdirectoryImageUrl ||
              faculty?.kelloggdirectory_image_url ||
              faculty?.imageUrl ||
              faculty?.image_url ||
              undefined
            }
            cutoutImageUrl={faculty?.cutoutImage || faculty?.cutout_image || undefined}
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
}

