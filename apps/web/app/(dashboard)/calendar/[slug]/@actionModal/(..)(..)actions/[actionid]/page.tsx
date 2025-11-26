import ActionDialogShell from "@/app/(dashboard)/calendar/[slug]/@actionModal/ActionDialogShell";
import ActionDialogContent from "./ActionDialogContent";
import { getActionById } from "@/lib/data/actions/action";
import { addDisplayColumns } from "@/lib/data/calendar/actionUtils";

type ActionsPageProps = {
  params: Promise<{
    slug: string;
    actionid: string;
  }>;
};

export default async function ActionsPage({ params }: ActionsPageProps) {
  const { slug, actionid } = await params;
  // Fetch action server-side and ensure it's in the store
  // Since this is an intercepted route, action should already be in store,
  // but we fetch here to ensure it's available
  const action = await getActionById(actionid);
  const hydratedAction = action ? addDisplayColumns([action])[0] : null;

  return (
    <ActionDialogShell>
      <ActionDialogContent actionId={actionid} slug={slug} initialAction={hydratedAction} />
    </ActionDialogShell>
  );
}

