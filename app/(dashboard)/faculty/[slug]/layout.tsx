import React, { Suspense } from "react";

export default function FacultyPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {" "}
      <Suspense>{children}</Suspense>
    </div>
  );
}
