import FilterDialogClient from "./filter-dialog-client";
import FilterRoomsModal from "@/app/(dashboard)/calendar/[slug]/components/FilterRoomsModal";

export async function Filters() {
  return (
    <FilterDialogClient>
      <FilterRoomsModal />
    </FilterDialogClient>
  );
}
