import type { ReactNode } from "react";

type CalendarPageLayoutProps = Readonly<{
  children: ReactNode;
  eventModal: ReactNode;
  actionModal: ReactNode;
  facultyModal: ReactNode;
}>;

export default function CalendarPageLayout({
  children,
}: CalendarPageLayoutProps) {
  return <>{children}</>;
}
