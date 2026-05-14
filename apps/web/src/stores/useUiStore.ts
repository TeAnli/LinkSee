import { create } from 'zustand';

interface UiState {
  sidebarCollapsed: boolean;
  adminSidebarCollapsed: boolean;
  globalLoading: boolean;
  modalStack: string[];
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleAdminSidebar: () => void;
  setAdminSidebarCollapsed: (v: boolean) => void;
  setGlobalLoading: (v: boolean) => void;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  adminSidebarCollapsed: false,
  globalLoading: false,
  modalStack: [],

  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setSidebarCollapsed: (v) =>
    set({ sidebarCollapsed: v }),

  toggleAdminSidebar: () =>
    set((s) => ({ adminSidebarCollapsed: !s.adminSidebarCollapsed })),

  setAdminSidebarCollapsed: (v) =>
    set({ adminSidebarCollapsed: v }),

  setGlobalLoading: (v) =>
    set({ globalLoading: v }),

  openModal: (id) =>
    set((s) => ({ modalStack: s.modalStack.includes(id) ? s.modalStack : [...s.modalStack, id] })),

  closeModal: (id) =>
    set((s) => ({ modalStack: s.modalStack.filter((m) => m !== id) })),

  closeAllModals: () =>
    set({ modalStack: [] }),
}));
