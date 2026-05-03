import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '../../stores/useThemeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { hue, mode } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;

    // Apply hue as CSS variable
    root.style.setProperty('--hue', String(hue));

    // Apply dark/light class
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [hue, mode]);

  return <>{children}</>;
}
