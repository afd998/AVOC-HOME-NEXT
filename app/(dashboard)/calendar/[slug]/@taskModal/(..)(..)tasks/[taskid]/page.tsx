import TaskDialogShell from "@/app/(dashboard)/calendar/[slug]/@taskModal/TaskDialogShell";

export default function TasksPage() {
  return (
    <TaskDialogShell>
      <TaskDialogContent />
    </TaskDialogShell>
  );
}

async function TaskDialogContent() {
  return <div>TaskDialogContent</div>;
}
