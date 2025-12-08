import { create } from "zustand";

type HoveredActionId = number | string | null;

type ActionHoverStore = {
  hoveredActionId: HoveredActionId;
  setHoveredActionId: (actionId: HoveredActionId) => void;
  setActionPanelHover: (actionId: HoveredActionId) => void;
  actionPanelHoverId: HoveredActionId;
};

export const useActionHoverStore = create<ActionHoverStore>((set) => ({
  hoveredActionId: null,
  actionPanelHoverId: null,
  setHoveredActionId: (hoveredActionId) => set({ hoveredActionId }),
  setActionPanelHover: (actionPanelHoverId) => set({ actionPanelHoverId }),
}));
