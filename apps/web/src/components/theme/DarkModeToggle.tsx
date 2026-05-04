import { useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '../../stores/useThemeStore';

const reducedMotionQuery =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

function SunIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function DarkModeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const isAnimating = useRef(false);

  const isDark = mode === 'dark';

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isAnimating.current) return;

      const nextMode = isDark ? 'light' : 'dark';

      if (reducedMotionQuery?.matches) {
        setMode(nextMode);
        return;
      }

      const doc = document as unknown as {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> };
      };

      if (!doc.startViewTransition) {
        setMode(nextMode);
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const maxX = Math.max(x, window.innerWidth - x);
      const maxY = Math.max(y, window.innerHeight - y);
      const radius = Math.hypot(maxX, maxY);

      const root = document.documentElement;
      root.style.setProperty('--theme-toggle-x', `${x}px`);
      root.style.setProperty('--theme-toggle-y', `${y}px`);
      root.style.setProperty('--theme-toggle-radius', `${radius}px`);

      isAnimating.current = true;

      const vt = doc.startViewTransition(() => {
        flushSync(() => {
          setMode(nextMode);
        });
      });

      vt.finished.then(() => {
        isAnimating.current = false;
      });
    },
    [isDark, setMode],
  );

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div
        style={{
          transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {isDark ? <MoonIcon size={20} /> : <SunIcon size={20} />}
      </div>
    </Button>
  );
}
