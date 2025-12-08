import { create } from "zustand";

export type ActionPanelTab = "all" | "mine";

type ActionPanelStore = {
  activeTab: ActionPanelTab;
  setActiveTab: (tab: ActionPanelTab) => void;
  currentUserId: string | null;
  setCurrentUserId: (userId: string | null) => void;
};

export const useActionPanelStore = create<ActionPanelStore>((set) => ({
  activeTab: "all",
  setActiveTab: (tab) => set({ activeTab: tab }),
  currentUserId: null,
  setCurrentUserId: (currentUserId) => set({ currentUserId }),
}));
