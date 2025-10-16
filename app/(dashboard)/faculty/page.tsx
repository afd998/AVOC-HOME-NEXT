import FacultyDirectory from "./faculty-directory";
import { getFacultyPage } from "@/lib/data/faculty";
import React from "react";

const sortByName = (aName?: string | null, bName?: string | null) => {
  const aNormalized = aName?.toLocaleLowerCase("en-US").trim() ?? "";
  const bNormalized = bName?.toLocaleLowerCase("en-US").trim() ?? "";

  if (aNormalized === bNormalized) {
    return 0;
  }

  return aNormalized < bNormalized ? -1 : 1;
};

export default async function FacultyPage() {
  const faculty = await getFacultyPage(0);

  const sortedFaculty = [...faculty].sort((a, b) =>
    sortByName(
      a.kelloggdirectoryName ?? a.twentyfiveliveName,
      b.kelloggdirectoryName ?? b.twentyfiveliveName
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Faculty Directory
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Browse the Kellogg faculty roster and quickly filter by name.
            </p>
          </header>
          <React.Suspense>
            <FacultyDirectory/>
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}
