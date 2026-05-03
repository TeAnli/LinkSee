import { useEffect } from 'react';

export function useSyncCSSVar(name: string, value: string) {
  useEffect(() => {
    document.documentElement.style.setProperty(name, value);
    return () => {
      document.documentElement.style.removeProperty(name);
    };
  }, [name, value]);
}
