import React, { Suspense } from "react";
import FacultyProfile from "@/core/faculty/FacultyProfile";
import { getFacultyById } from "@/lib/data/faculty";


export default async function FacultyProfilePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;

  const facultyMember = await getFacultyById(Number(slug));

  if (!facultyMember) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Faculty Member Not Found</h1>
          <p className="text-muted-foreground">The faculty member you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <div className="md:py-3 lg:px-6 px-0 xl:px-20">
        <Suspense>
          <FacultyProfile facultyMember={facultyMember} />
        </Suspense>
      </div>
    </div>
  );
}
