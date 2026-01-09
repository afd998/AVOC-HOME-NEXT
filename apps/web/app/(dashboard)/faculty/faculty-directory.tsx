"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { FacultySearchCard } from "./components/faculty-search-card";
import { FacultyList } from "./components/faculty-list";
import type { FacultyCardData } from "./components/faculty-card";

type FacultyRecord = {
  id: number;
  kelloggdirectoryName?: string | null;
  twentyfiveliveName?: string | null;
  kelloggdirectoryTitle?: string | null;
  kelloggdirectoryBio?: string | null;
  cutoutImage?: string | null;
  kelloggdirectoryImageUrl?: string | null;
  email?: string | null;
  kelloggdirectoryBioUrl?: string | null;
};

export default function FacultyDirectory({
  faculty,
}: {
  faculty: FacultyRecord[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("en-US");

  const filteredRows = useMemo(() => {
    const hasQuery = normalizedQuery.length > 0;
    const filtered = hasQuery
      ? faculty.filter((person) => {
          const fields = [
            person.kelloggdirectoryName ?? "",
            person.twentyfiveliveName ?? "",
          ].map((value) => value.toLocaleLowerCase("en-US"));

          return fields.some((field) => field.includes(normalizedQuery));
        })
      : faculty;

    return filtered.map(
      (person): FacultyCardData => ({
        id: person.id,
        name:
          person.kelloggdirectoryName ??
          person.twentyfiveliveName ??
          "Unknown",
        title: person.kelloggdirectoryTitle ?? "",
        cutoutImageUrl: person.cutoutImage ?? null,
        imageUrl: person.kelloggdirectoryImageUrl ?? null,
        email: person.email ?? null,
        directoryUrl: person.kelloggdirectoryBioUrl ?? null,
      })
    );
  }, [faculty, normalizedQuery]);

  const hasQuery = normalizedQuery.length > 0;
  const matchCount = filteredRows.length;

  const navigateToFaculty = (id: number) => {
    router.push(`/faculty/${id}`);
  };

  return (
    <div className="flex flex-col xl:flex-row h-full min-h-0 min-w-0 gap-4 p-4">
      {/* Search card - sticky on large screens */}
      <div className="flex-shrink-0 xl:w-80 xl:sticky xl:top-4 xl:self-start">
        <FacultySearchCard
          query={query}
          onQueryChange={setQuery}
          totalCount={faculty.length}
          matchCount={matchCount}
          hasQuery={hasQuery}
        />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto">
        <FacultyList
          rows={filteredRows}
          hasQuery={hasQuery}
          query={query}
          onFacultyClick={navigateToFaculty}
        />
      </div>
    </div>
  );
}
