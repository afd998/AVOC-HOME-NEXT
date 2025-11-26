import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";

export default async function CalendarPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalendarPageContent />
    </Suspense>
  );
}

async function CalendarPageContent() {
  await headers();
  // Get today's date in YYYY-MM-D format
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;
console.log("calendar page");
  redirect(`/calendar/${dateString}`);
  return null;
}
