import type { ReactNode } from "react";

type CalendarPageLayoutProps = Readonly<{
  children: ReactNode;
  eventModal: ReactNode;
  taskModal: ReactNode;
  facultyModal: ReactNode;
}>;

export default function CalendarPageLayout({
  children,
  eventModal,
  taskModal,
  facultyModal,
}: CalendarPageLayoutProps) {

  return (
    <>
      {children}
      {eventModal}
      {taskModal}
      {facultyModal}
    </>
  );
}
