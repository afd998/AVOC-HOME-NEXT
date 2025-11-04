import TaskDialogShell from "@/app/(dashboard)/calendar/[slug]/@taskModal/TaskDialogShell";
import TaskDialogContent from "./TaskDialogContent";
import { getTaskById } from "@/lib/data/tasks/task";
import { addDisplayColumns } from "@/lib/data/calendar/taskUtils";

type TasksPageProps = {
  params: Promise<{
    slug: string;
    taskid: string;
  }>;
};

export default async function TasksPage({ params }: TasksPageProps) {
  const { slug, taskid } = await params;
  // Fetch task server-side and ensure it's in the store
  // Since this is an intercepted route, task should already be in store,
  // but we fetch here to ensure it's available
  const task = await getTaskById(taskid);
  const hydratedTask = task ? addDisplayColumns([task])[0] : null;

  return (
    <TaskDialogShell>
      <TaskDialogContent taskId={taskid} slug={slug} initialTask={hydratedTask} />
    </TaskDialogShell>
  );
}
