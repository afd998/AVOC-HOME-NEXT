import { create } from "zustand";

type CalendarLayoutStore = {
  actionPanelVisible: boolean;
  setActionPanelVisible: (visible: boolean) => void;
  toggleActionPanelVisible: () => void;
};

export const useCalendarLayoutStore = create<CalendarLayoutStore>((set) => ({
  actionPanelVisible: true,
  setActionPanelVisible: (visible) => set({ actionPanelVisible: visible }),
  toggleActionPanelVisible: () =>
    set((state) => ({ actionPanelVisible: !state.actionPanelVisible })),
}));
