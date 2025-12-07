import FacultyDirectory from "./faculty-directory";
import { getAllFaculty } from "@/lib/data/faculty";
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
  const faculty = await getAllFaculty();

  const sortedFaculty = [...faculty].sort((a, b) =>
    sortByName(
      a.kelloggdirectoryName ?? a.twentyfiveliveName,
      b.kelloggdirectoryName ?? b.twentyfiveliveName
    )
  );

  return (
    <div className="bg-background flex-1 min-h-0">
      <div className="bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col gap-8 px-6 py-6">
          <React.Suspense>
            <FacultyDirectory faculty={sortedFaculty} />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}
