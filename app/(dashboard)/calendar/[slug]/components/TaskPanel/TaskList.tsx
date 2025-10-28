import { ItemGroup } from "@/components/ui/item";

import RecordingGroup from "./RecordingGroup";
import TaskRow from "./TaskRow";
import type { TaskListItem } from "./types";

type TaskListProps = {
  items: TaskListItem[];
};

export default function TaskList({ items }: TaskListProps) {
  return (
    <ItemGroup className="gap-3">
      {items.map((item, index) => {
        if (item.type === "task") {
          return <TaskRow key={item.entry.task.id} entry={item.entry} />;
        }

        return (
          <RecordingGroup
            key={`${item.groupKey}-${index}`}
            group={item}
          />
        );
      })}
    </ItemGroup>
  );
}
