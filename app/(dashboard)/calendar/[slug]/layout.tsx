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
  return <>{children}{eventModal}{taskModal}</>;
}
