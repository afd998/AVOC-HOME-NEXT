import { create } from 'zustand'

// ShiftBlock type matching the database schema
interface ShiftBlock {
  id: number
  created_at: string
  assignments: unknown
  start_time: string | null
  end_time: string | null
  date: string | null
}

interface EventAssignmentsStore {
  // Toggle visibility
  showEventAssignments: boolean
  setShowEventAssignments: (show: boolean) => void
  toggleEventAssignments: () => void
  // Selected shift block state
  selectedShiftBlockId: string | null
  setSelectedShiftBlockId: (id: string | null) => void
  selectedShiftBlock: ShiftBlock | null
  setSelectedShiftBlock: (block: ShiftBlock | null) => void
  selectedShiftBlockIndex: number | null
  setSelectedShiftBlockIndex: (index: number | null) => void
}

export const useEventAssignmentsStore = create<EventAssignmentsStore>((set) => ({
  showEventAssignments: false,
  setShowEventAssignments: (show) => set({ showEventAssignments: show }),
  toggleEventAssignments: () => set((state) => ({ showEventAssignments: !state.showEventAssignments })),
  // Selected shift block state
  selectedShiftBlockId: null,
  setSelectedShiftBlockId: (id) => set({ selectedShiftBlockId: id }),
  selectedShiftBlock: null,
  setSelectedShiftBlock: (block) => set({ selectedShiftBlock: block }),
  selectedShiftBlockIndex: null,
  setSelectedShiftBlockIndex: (index) => set({ selectedShiftBlockIndex: index }),
}))
