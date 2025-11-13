import { db } from "@/lib/db";
import { type TaskRow } from "../../../scrape";
import { type QcItemRow } from "../../../scrape";
import { qcItemDict } from "@/lib/db/schema";
export async function getQcItemRows(tasks: TaskRow[]): Promise<QcItemRow[]> {
  // TODO: Implement logic to create QcItemRow[] from filtered tasks
  let qcItemRows: QcItemRow[] = [];
  const qcItemDictRows = await db.select().from(qcItemDict);

  tasks
    .filter(
      (task): task is TaskRow & { id: number } =>
        task.taskType === "RECORDING CHECK"
    )
    .forEach((task) => {
      qcItemDictRows.forEach((qcItemDictRow) => {
        qcItemRows.push({
          qc: task.id,
          qcItemDict: qcItemDictRow.id,
          status: null,
          snTicket: null,
        });
      });
    });
  return qcItemRows;
}
