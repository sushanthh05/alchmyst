import { create } from 'zustand';

interface SelectionState {
  selectedId: string | null;
  selectedSource: 'chat' | 'timeline' | null;
  select: (id: string, source: 'chat' | 'timeline') => void;
  clear: () => void;
}

let autoClearTimeout: NodeJS.Timeout | null = null;

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedId: null,
  selectedSource: null,

  select: (id, source) => {
    // Clear any existing timeout
    if (autoClearTimeout) {
      clearTimeout(autoClearTimeout);
    }

    set({ selectedId: id, selectedSource: source });
    
    console.log(`[LINK] ${source === 'chat' ? 'Chat -> Timeline' : 'Timeline -> Chat'} call_id=${id}`);

    // Auto-clear after 2 seconds
    autoClearTimeout = setTimeout(() => {
      set({ selectedId: null, selectedSource: null });
    }, 2000);
  },

  clear: () => {
    if (autoClearTimeout) {
      clearTimeout(autoClearTimeout);
      autoClearTimeout = null;
    }
    set({ selectedId: null, selectedSource: null });
  },
}));
