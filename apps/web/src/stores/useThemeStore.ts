import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  /** Hue value 0-360 */
  hue: number;
  /** 'light' or 'dark' */
  mode: 'light' | 'dark';
  /** Sidebar collapsed */
  sidebarCollapsed: boolean;
  setHue: (hue: number) => void;
  toggleMode: () => void;
  setMode: (mode: 'light' | 'dark') => void;
  toggleSidebar: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      hue: 250,
      mode: 'light',
      sidebarCollapsed: false,
      setHue: (hue: number) => {
        set({ hue });
        // Immediately apply CSS variable
        document.documentElement.style.setProperty('--hue', String(hue));
      },
      toggleMode: () =>
        set((state) => {
          const next = state.mode === 'light' ? 'dark' : 'light';
          return { mode: next };
        }),
      setMode: (mode) => set({ mode }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'linksee-theme',
      partialize: (state) => ({
        hue: state.hue,
        mode: state.mode,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
