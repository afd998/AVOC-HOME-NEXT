import { getFilters } from "@/lib/data/filters";
import FilterDialogClient from "./filter-dialog-client";
import FilterRoomsModal from "@/app/(dashboard)/calendar/[slug]/components/FilterRoomsModal";
import getMyProfile from "@/lib/data/profile";
import { profiles } from "@/drizzle/schema";

type Profile = typeof profiles.$inferSelect;

export async function Filters() {
  const { profile } = await getMyProfile();
  return (
    <FilterDialogClient profile={profile}>
      <FilterRoomsModal   profile={profile as Profile}/>
    </FilterDialogClient>
  );
}
