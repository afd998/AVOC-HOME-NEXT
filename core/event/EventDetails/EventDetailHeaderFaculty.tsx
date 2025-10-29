"use client";

import type { finalEvent } from "@/lib/data/calendar/calendar";
import type { FacultyAvatarItem } from "../../faculty/FacultyAvatar";
import {
  FacultyAvatarStack,
  createFacultyStub,
} from "../../faculty/FacultyAvatar";

interface EventDetailHeaderFacultyProps {
  event: finalEvent;
}

export default function EventDetailHeaderFaculty({
  event,
}: EventDetailHeaderFacultyProps) {
  const instructorNames = Array.isArray(event.instructorNames)
    ? event.instructorNames
        .map((name) => (typeof name === "string" ? name.trim() : ""))
        .filter(Boolean)
    : [];

  const normalizedFaculty = (event.faculty ?? [])
    .filter(Boolean)
    .map((member) => member as FacultyAvatarItem);

  const fallbackFaculty =
    normalizedFaculty.length === 0
      ? instructorNames.map((name, index) =>
          createFacultyStub(name, `fallback-${index}`)
        )
      : [];

  const displayFaculty =
    normalizedFaculty.length > 0 ? normalizedFaculty : fallbackFaculty;

  if (displayFaculty.length === 0) {
    return null;
  }

  const totalFacultyCount = displayFaculty.length;
  const isSingleFaculty = totalFacultyCount === 1;

  return (
    <div className="relative shrink-0">
      <div className="mb-4 flex flex-col items-center">
        <div className="relative z-20 flex items-center justify-center rounded-lg border border-purple-300/20 bg-linear-to-br from-purple-900/20 to-blue-900/20 p-2 shadow-lg backdrop-blur-sm">
          <FacultyAvatarStack
            faculty={displayFaculty}
            maxVisible={3}
            size={isSingleFaculty ? "lg" : "md"}
            className="justify-center"
            avatarClassName={isSingleFaculty ? "!h-20 !w-20" : "!h-12 !w-12"}
            overlapClassName="-space-x-2"
            remainingBadgeClassName="border-2 border-white text-white font-medium text-sm !h-12 !w-12"
          />
        </div>
      </div>
    </div>
  );
}
