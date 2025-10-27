export default function CalendarLayout({
  children,
  eventModal,
  taskModal,
}: {
  children: React.ReactNode;
  eventModal: React.ReactNode;
  taskModal: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {eventModal}
    </div>
  );
}
