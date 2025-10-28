import type { ReactNode } from "react";

type CalendarPageLayoutProps = Readonly<{
  children: ReactNode;
  eventModal: ReactNode;
  taskModal: ReactNode;
}>;

export default function CalendarPageLayout({
  children,
  eventModal,
  taskModal,
}: CalendarPageLayoutProps) {
  console.log("slug layout");
  return (
    <>
      {children}
      {eventModal}
      {taskModal}
    </>
  );
}
