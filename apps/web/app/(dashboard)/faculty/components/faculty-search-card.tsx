"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FacultyIcon } from "@/app/(dashboard)/components/sidebar/faculty-icon";

type FacultySearchCardProps = {
  query: string;
  onQueryChange: (query: string) => void;
  totalCount: number;
  matchCount: number;
  hasQuery: boolean;
};

export function FacultySearchCard({
  query,
  onQueryChange,
  totalCount,
  matchCount,
  hasQuery,
}: FacultySearchCardProps) {
  return (
    <Card className="bg-background shadow-md w-full border-b">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FacultyIcon className="h-5 w-5" />
          <span>Faculty Directory</span>
        </CardTitle>
        <CardDescription>
          Search for Kellogg faculty by directory name or 25Live name.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search faculty by name..."
            className="flex-1"
          />
          <Badge variant="secondary" className="w-fit">
            {hasQuery
              ? `${matchCount.toLocaleString()} match${matchCount === 1 ? "" : "es"}`
              : totalCount.toLocaleString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
