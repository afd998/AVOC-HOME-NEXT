"use client";

import type { ReactNode } from "react";
import {
  FacultyAvatarItem,
  FacultyAvatarSize,
  FacultyAvatarStack,
  createFacultyStub,
  getFacultyDisplayNames,
} from "@/core/faculty/FacultyAvatar";
import { extractLastNames } from "@/core/faculty/utils";
import { cn } from "@/lib/utils";

export interface EventFacultySummaryProps {
  faculty?: Array<FacultyAvatarItem | null | undefined> | null;
  instructorNames?: Array<string | null | undefined>;
  maxVisible?: number;
  size?: FacultyAvatarSize;
  className?: string;
  avatarsClassName?: string;
  avatarClassName?: string;
  overlapClassName?: string;
  remainingBadgeClassName?: string;
  namesClassName?: string;
  showNames?: boolean;
  nameFormatter?: (context: {
    displayedNames: string[];
    allNames: string[];
    maxVisible: number;
    totalCount: number;
  }) => ReactNode;
  nameFallback?: string;
}

const defaultRootClasses =
  "flex flex-col items-center justify-center gap-0.5";

export function EventFacultySummary({
  faculty,
  instructorNames,
  maxVisible = 3,
  size = "md",
  className,
  avatarsClassName,
  avatarClassName,
  overlapClassName,
  remainingBadgeClassName,
  namesClassName,
  showNames = true,
  nameFormatter,
  nameFallback = "",
}: EventFacultySummaryProps) {
  const sanitizedInstructorNames =
    instructorNames?.map((name) =>
      typeof name === "string" ? name.trim() : ""
    ).filter(Boolean) ?? [];

  const normalizedFaculty = (faculty ?? [])
    .filter(Boolean)
    .map((member) => member as FacultyAvatarItem);

  const fallbackFaculty =
    normalizedFaculty.length === 0
      ? sanitizedInstructorNames.map((name, index) =>
          createFacultyStub(name, `fallback-${index}`)
        )
      : [];

  const displayFaculty =
    normalizedFaculty.length > 0 ? normalizedFaculty : fallbackFaculty;
  const shouldRenderAvatars = displayFaculty.length > 0;

  const allNames = getFacultyDisplayNames(displayFaculty, {
    fallbackNames: sanitizedInstructorNames,
  });
  const displayedNames = getFacultyDisplayNames(displayFaculty, {
    fallbackNames: sanitizedInstructorNames,
    max: maxVisible,
  });
  const totalCount = displayFaculty.length;

  const formattedNames =
    nameFormatter?.({
      displayedNames,
      allNames,
      maxVisible,
      totalCount,
    }) ??
    (displayedNames.length > 0 ? extractLastNames(displayedNames) : "");

  const formattedIsString = typeof formattedNames === "string";
  const trimmedString = formattedIsString
    ? (formattedNames as string).trim()
    : "";
  const hasCustomNode = !formattedIsString && Boolean(formattedNames);

  const nameContent = hasCustomNode
    ? formattedNames
    : trimmedString || nameFallback.trim();

  const shouldShowNames =
    showNames && Boolean(nameContent && `${nameContent}`.length > 0);

  if (!shouldRenderAvatars && !shouldShowNames) {
    return null;
  }

  const defaultNameClass =
    totalCount > 12 ? "text-[8px]" : "text-[10px]";

  return (
    <div className={cn(defaultRootClasses, className)}>
      {shouldRenderAvatars && (
        <FacultyAvatarStack
          faculty={displayFaculty}
          maxVisible={maxVisible}
          size={size}
          className={cn("justify-center", avatarsClassName)}
          avatarClassName={avatarClassName}
          overlapClassName={overlapClassName}
          remainingBadgeClassName={remainingBadgeClassName}
        />
      )}
      {shouldShowNames && (
        <div
          className={cn(
            "leading-tight font-medium opacity-90 text-center whitespace-nowrap text-foreground",
            defaultNameClass,
            namesClassName
          )}
          title={allNames.length ? allNames.join(", ") : undefined}
        >
          {nameContent}
        </div>
      )}
    </div>
  );
}
