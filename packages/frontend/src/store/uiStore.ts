import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isModalOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  toggleModal: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isModalOpen: false,
  theme: 'light',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),
  setTheme: (theme) => set({ theme }),
}));
