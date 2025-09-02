import { create } from 'zustand';

interface UiState {
  openFileIds: string[];
  activeFileId: string | null;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFileId: (fileId: string | null) => void;
  // New state
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isPreviewOpen: boolean;
  togglePreview: () => void;
  // Mock auth state
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  openFileIds: [],
  activeFileId: null,
  isLoginModalOpen: false,
  isPreviewOpen: false,
  isAuthenticated: false,
  username: null,
  
  setActiveFileId: (fileId) => {
    set({ activeFileId: fileId });
  },
  openFile: (fileId) => {
    const { openFileIds } = get();
    if (!openFileIds.includes(fileId)) {
      set({ openFileIds: [...openFileIds, fileId], activeFileId: fileId });
    } else {
      set({ activeFileId: fileId });
    }
  },
  closeFile: (fileId) => {
    const { openFileIds, activeFileId } = get();
    const newOpenFileIds = openFileIds.filter((id) => id !== fileId);

    let newActiveFileId = activeFileId;
    if (activeFileId === fileId) {
      if (newOpenFileIds.length === 0) {
        newActiveFileId = null;
      } else {
        const closingIndex = openFileIds.findIndex((id) => id === fileId);
        // select previous tab, or the new first tab if the first was closed
        newActiveFileId = newOpenFileIds[Math.max(0, closingIndex - 1)];
      }
    }
    set({ openFileIds: newOpenFileIds, activeFileId: newActiveFileId });
  },

  // New functions
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  togglePreview: () => set(state => ({ isPreviewOpen: !state.isPreviewOpen })),
  login: (username) => set({ isAuthenticated: true, username, isLoginModalOpen: false }),
  logout: () => set({ isAuthenticated: false, username: null }),
}));
