"use client";

import ActionContent from "@/core/actions/ActionContent";
import { useActionQuery } from "@/lib/query";
import { Card } from "@/components/ui/card";

type ActionContentWrapperProps = {
  actionId: string;
};

export default function ActionContentWrapper({
  actionId,
}: ActionContentWrapperProps) {
  const { data: action, isLoading } = useActionQuery({ actionId });

  if (isLoading) {
    return (
      <Card className="flex flex-col h-full overflow-hidden px-0 md:px-6 lg:px-8 xl:px-10">
        <div>Loading...</div>
      </Card>
    );
  }

  if (!action) {
    return (
      <Card className="flex flex-col h-full overflow-hidden px-0 md:px-6 lg:px-8 xl:px-10">
        <div>Action not found (ID: {actionId})</div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden px-0 md:px-6 lg:px-8 xl:px-10">
      <ActionContent action={action} />
    </Card>
  );
}
