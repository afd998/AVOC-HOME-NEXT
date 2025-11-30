import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import ActionDialogShell from "@/app/(dashboard)/calendar/[slug]/@actionModal/ActionDialogShell";
import ActionDialogContent from "./ActionDialogContent";
import { getActionById } from "@/lib/data/actions/action";
import { addDisplayColumns } from "@/lib/data/calendar/actionUtils";
import { getQueryClient } from "@/lib/query";

type ActionsPageProps = {
  params: Promise<{
    slug: string;
    actionid: string;
  }>;
};

export default async function ActionsPage({ params }: ActionsPageProps) {
  const { slug, actionid } = await params;
  
  const queryClient = getQueryClient();

  // Prefetch the action
  const action = await getActionById(actionid);
  if (action) {
    const hydratedAction = addDisplayColumns([action])[0];

    await queryClient.prefetchQuery({
      queryKey: ["action", actionid],
      queryFn: () => Promise.resolve(hydratedAction),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ActionDialogShell>
        <ActionDialogContent actionId={actionid} slug={slug} />
      </ActionDialogShell>
    </HydrationBoundary>
  );
}
