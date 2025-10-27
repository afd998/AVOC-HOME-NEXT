import { CalendarShellProvider } from "@/app/(dashboard)/calendar/[slug]/components/CalendarShellProvider";
import type { ReactNode } from "react";

export default function CalendarPageLayout({
  children,
  eventModal,
  taskModal,
}: Readonly<{
  children: ReactNode;
  eventModal: ReactNode;
  taskModal: ReactNode;
}>) {
  return (
    <CalendarShellProvider>
      {children}
      {eventModal}
      {taskModal}
    </CalendarShellProvider>
  );
}
