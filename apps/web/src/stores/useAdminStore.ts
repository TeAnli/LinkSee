import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
  sidebarCollapsed: boolean;
  currentPageTitle: string;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setCurrentPageTitle: (t: string) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      currentPageTitle: 'Dashboard',

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarCollapsed: (v) =>
        set({ sidebarCollapsed: v }),

      setCurrentPageTitle: (t) =>
        set({ currentPageTitle: t }),
    }),
    {
      name: 'linksee-admin',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
