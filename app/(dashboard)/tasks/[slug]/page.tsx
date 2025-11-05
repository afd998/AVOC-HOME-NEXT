import TaskContentWrapper from "./TaskContentWrapper";
import { getTaskById } from "@/lib/data/tasks/task";
import { addDisplayColumns } from "@/lib/data/calendar/taskUtils";

type TasksPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TasksPage(props: TasksPageProps) {
  const { slug } = await props.params;

  const task = await getTaskById(slug);
  if (!task) {
    return <div>Task not found (ID: {slug})</div>;
  }

  // TaskWithDict is compatible with TaskRow (which is an alias for TaskWithDict)
  const hydratedTask = addDisplayColumns([
    task as Parameters<typeof addDisplayColumns>[0][0],
  ])[0];
  return <TaskContentWrapper taskId={slug} initialTask={hydratedTask} />;
}
