import TaskDialogShell from "@/app/(dashboard)/calendar/[slug]/@taskModal/TaskDialogShell";
import TaskDialogContent from "./TaskDialogContent";

type TasksPageProps = {
  params: Promise<{
    slug: string;
    taskid: string;
  }>;
};

export default async function TasksPage({ params }: TasksPageProps) {
  const { slug, taskid } = await params;

  return (
    <TaskDialogShell>
      <TaskDialogContent taskId={taskid} slug={slug} />
    </TaskDialogShell>
  );
}
