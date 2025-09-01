
import { create } from 'zustand';

interface UiState {
  activeFileId: string | null;
  setActiveFileId: (fileId: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeFileId: null,
  setActiveFileId: (fileId) => set({ activeFileId: fileId }),
}));
