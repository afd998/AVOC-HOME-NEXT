import SeriesSearch from "./series-search";

export default function SeriesPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 py-8">
          <SeriesSearch />
        </div>
      </div>
    </div>
  );
}
