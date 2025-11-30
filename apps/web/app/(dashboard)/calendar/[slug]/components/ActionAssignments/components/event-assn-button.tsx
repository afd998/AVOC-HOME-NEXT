"use client";

import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { useEventAssignmentsStore } from "@/lib/stores/event-assignments";

export default function ActionAssnButton() {
  const { showEventAssignments, toggleEventAssignments } = useEventAssignmentsStore();

  return (
    <Button
      onClick={toggleEventAssignments}
      variant={showEventAssignments ? "destructive" : "outline"}
      size="sm"
      className="h-8 px-3"
    >
      <ClipboardList className="h-4 w-4 mr-2" />
      {showEventAssignments ? "Close Assignments" : "Assignments"}
    </Button>
  );
}
