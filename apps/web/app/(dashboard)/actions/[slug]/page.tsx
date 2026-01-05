"use cache";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import ActionContentWrapper from "./ActionContentWrapper";
import { getActionById } from "@/lib/data/actions/action";
import { addDisplayColumns } from "@/lib/data/calendar/actionUtils";
import { getQueryClient } from "@/lib/query";
import { Suspense } from "react";
type ActionsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ActionsPage(props: ActionsPageProps) {
  const { slug } = await props.params;

  const queryClient = getQueryClient();

  // Prefetch the action
  const action = await getActionById(slug);
  if (action) {
    const hydratedAction = addDisplayColumns([
      action as Parameters<typeof addDisplayColumns>[0][0],
    ])[0];

    await queryClient.prefetchQuery({
      queryKey: ["action", slug],
      queryFn: () => Promise.resolve(hydratedAction),
    });
  }

  return (
    <Suspense>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ActionContentWrapper actionId={slug} />
      </HydrationBoundary>
    </Suspense>
  );
}
