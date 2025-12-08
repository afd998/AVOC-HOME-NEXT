import SeriesSearch from "./series-search";

export default function SeriesPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full flex-1 min-h-0 flex-col gap-8 px-6 py-8">
          <SeriesSearch />
        </div>
      </div>
    </div>
  );
}
