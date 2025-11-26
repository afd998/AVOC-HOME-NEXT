"use client";

import type { finalEvent } from "@/lib/data/calendar/calendar";
import { ItemGroup } from "@/components/ui/item";
import { FacultyItem } from "@/core/faculty/FacultyItem";

type EventFacultyListProps = {
  faculty: finalEvent["faculty"];
};

export function EventFacultyList({ faculty }: EventFacultyListProps) {
  if (!faculty?.length) {
    return null;
  }

  return (
    <ItemGroup>
      {faculty.map((member) => (
        <FacultyItem key={member.id} faculty={member} />
      ))}
    </ItemGroup>
  );
}
