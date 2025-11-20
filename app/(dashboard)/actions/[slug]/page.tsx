import ActionContentWrapper from "./ActionContentWrapper";
import { getActionById } from "@/lib/data/actions/action";
import { addDisplayColumns } from "@/lib/data/calendar/actionUtils";

type ActionsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ActionsPage(props: ActionsPageProps) {
  const { slug } = await props.params;

  const action = await getActionById(slug);
  if (!action) {
    return <div>Action not found (ID: {slug})</div>;
  }

  // ActionWithDict is compatible with ActionRow (which is an alias for ActionWithDict)
  const hydratedAction = addDisplayColumns([
    action as Parameters<typeof addDisplayColumns>[0][0],
  ])[0];
  
  return <ActionContentWrapper actionId={slug} initialAction={hydratedAction} />;
}
