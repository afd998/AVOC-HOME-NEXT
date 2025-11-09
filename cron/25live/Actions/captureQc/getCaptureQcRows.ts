import { type TaskRow } from "../../scrape";
import { type QcRow } from "../../scrape";

export async function getCaptureQcRows(tasks: TaskRow[]): Promise<QcRow[]> {
  getCaptureQcRows;
  const captureQc: QcRow[] = [];
  tasks
    .filter(
      (task): task is TaskRow & { id: number } =>
        task.taskType === "RECORDING CHECK"
    )
    .forEach((task) => {
      captureQc.push({
        task: task.id,
      });
    });

  return captureQc;
}
