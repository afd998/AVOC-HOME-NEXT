"use client";

import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; 
import { profiles } from "@/drizzle/schema";

type Profile = typeof profiles.$inferSelect;
const ModalCtx = createContext<{ close: () => void } | null>(null);
export function useModal() {
  const v = useContext(ModalCtx);
  if (!v) throw new Error("useModal must be used inside ModalClient");
  return v;
}

export default function FilterDialogClient({
  profile,
  children,
}: {
  profile?: Profile | null;
  children: ReactNode;
}) {
  const [openFilterRoomsModal, setOpenFilterRoomsModal] = useState(false);
  const close = useCallback(() => setOpenFilterRoomsModal(false), []);

  const currentFilter = profile?.currentFilter;
  return (
    <Dialog
      open={openFilterRoomsModal}
      onOpenChange={setOpenFilterRoomsModal}
    >
      <DialogTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="w-full flex flex-row justify-start outline-none"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpenFilterRoomsModal(true);
            }
          }}
        >
          <Filter className="h-4 w-4 mr-1" />
          <span>Filter Rooms</span>
          {currentFilter && (
            <Badge variant="outline" className="ml-auto text-xs">
              {currentFilter}
            </Badge>
          )}
        </div>
      </DialogTrigger>

      <ModalCtx.Provider value={{ close }}>
        {openFilterRoomsModal ? children : null}
      </ModalCtx.Provider>
    </Dialog>
  );
}

export function ModalCloseButton() {
  "use client";
  const { close } = useModal();
  return (
    <Button
      type="button"
      variant="outline"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        close();
      }}
    >
      Close
    </Button>
  );
}
