import { create } from 'zustand'

interface EventAssignmentsStore {
  showEventAssignments: boolean
  setShowEventAssignments: (show: boolean) => void
  toggleEventAssignments: () => void
}

export const useEventAssignmentsStore = create<EventAssignmentsStore>((set) => ({
  showEventAssignments: false,
  setShowEventAssignments: (show) => set({ showEventAssignments: show }),
  toggleEventAssignments: () => set((state) => ({ showEventAssignments: !state.showEventAssignments })),
}))
