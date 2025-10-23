import HomePage2 from "./components/HomePage2";

export default async function CalendarPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filter?: string; autoHide?: string }>;
}) {
  const params = await props.params;
  const slug = params.slug;
  const searchParams = await props.searchParams;
  const filter = searchParams.filter || "All Rooms";
  const autoHideParam = searchParams.autoHide;
  const autoHide = autoHideParam === "true" || autoHideParam === "1";

  return (
    <div>
      <HomePage2 filter={filter} autoHide={autoHide} slug={slug} />{" "}
    </div>
  );
}
