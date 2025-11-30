"use client";

import ActionContent from "@/core/actions/ActionContent";
import { useActionQuery } from "@/lib/query";

type ActionDialogContentProps = {
  actionId: string;
  slug: string;
};

export default function ActionDialogContent({
  actionId,
}: ActionDialogContentProps) {
  const { data: action, isLoading } = useActionQuery({ actionId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!action) {
    return null;
  }

  return <ActionContent action={action} />;
}
