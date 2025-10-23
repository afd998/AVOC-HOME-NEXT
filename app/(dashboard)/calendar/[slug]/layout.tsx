import { CalendarShellProvider } from "@/app/(dashboard)/calendar/[slug]/components/CalendarShellProvider";
import type { ReactNode } from "react";

export default function CalendarPageLayout({
  children,
  eventModal,
}: Readonly<{
  children: ReactNode;
  eventModal: ReactNode;
}>) {
  return (
    <CalendarShellProvider>
      {children}
      {eventModal}
    </CalendarShellProvider>
  );
}
