type NewActionPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewActionPage(props: NewActionPageProps) {
  const { slug } = await props.params;

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">New Action</h1>
      <p className="text-sm text-muted-foreground">
        Start a new action for event <span className="font-mono">{slug}</span>. Replace this placeholder with the creation form.
      </p>
    </div>
  );
}
