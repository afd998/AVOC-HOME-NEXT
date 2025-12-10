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
  const cardClassName =
    "flex flex-col h-full overflow-hidden px-0 md:px-6 lg:px-8 xl:px-10 bg-background border-0";

  if (isLoading) {
    return (
      <Card className={cardClassName}>
        <div>Loading...</div>
      </Card>
    );
  }

  if (!action) {
    return (
      <Card className={cardClassName}>
        <div>Action not found (ID: {actionId})</div>
      </Card>
    );
  }

  return (
    <Card className={cardClassName}>
      <ActionContent action={action} />
    </Card>
  );
}
