export default function CalendarLayout({
  children,
  eventModal,
}: {
  children: React.ReactNode;
  eventModal: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {eventModal}
    </div>
  );
}
