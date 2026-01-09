"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FacultyCard, type FacultyCardData } from "./faculty-card";

type FacultyListProps = {
  rows: FacultyCardData[];
  hasQuery: boolean;
  query: string;
  onFacultyClick: (id: number) => void;
};

export function FacultyList({
  rows,
  hasQuery,
  query,
  onFacultyClick,
}: FacultyListProps) {
  if (rows.length > 0) {
    return (
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <FacultyCard
            key={row.id}
            faculty={row}
            onClick={() => onFacultyClick(row.id)}
          />
        ))}
      </div>
    );
  }

  if (hasQuery) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No faculty found for &quot;{query}&quot;.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-12 text-center text-sm text-muted-foreground">
        Enter a query to explore faculty profiles.
      </CardContent>
    </Card>
  );
}
