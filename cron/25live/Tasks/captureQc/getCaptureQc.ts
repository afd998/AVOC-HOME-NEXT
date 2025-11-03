import { type TaskRow } from "../../scrape";
import { type CaptureQcRow } from "../../scrape";

export async function getCaptureQc(tasks: TaskRow[]): Promise<CaptureQcRow[]> {
  const captureQc: CaptureQcRow[] = [];
  tasks
    .filter(
      (task): task is TaskRow & { id: number } =>
        task.taskType === "RECORDING CHECK"
    )
    .forEach((task) => {
      captureQc.push({
        task: task.id,
        programVideoCamera: null,
        programVideoContent1: null,
        programVideoContent2: null,
        programAudio: null,
      });
    });

  return captureQc;
}
