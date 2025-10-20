import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../../components/ui/dialog";
import { ModalCloseButton } from "@/app/(dashboard)/components/sidebar/filter-dialog-client";
import { getFilters } from "@/lib/data/filters";
import FilterRoomsModalContent from "@/app/(dashboard)/calendar/[slug]/components/FilterRoomsModalContent";  

async function FilterRoomsModal() {
  const filters = await getFilters();

  return (
    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Filter Events</DialogTitle>
      </DialogHeader>

      <div className="py-4">
        <div className="space-y-4">
          <FilterRoomsModalContent
            filters={filters}
          />
        </div>
      </div>

      <DialogFooter>
        <ModalCloseButton />
      </DialogFooter>
    </DialogContent>
  );
}

export default FilterRoomsModal;
