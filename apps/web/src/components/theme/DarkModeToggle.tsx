import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useThemeStore } from '../../stores/useThemeStore';

interface RippleOverlayProps {
  x: number;
  y: number;
  isDark: boolean;
  onComplete: () => void;
}

function RippleOverlay({ x, y, isDark, onComplete }: RippleOverlayProps) {
  const [phase, setPhase] = useState<'expand' | 'collapse'>('expand');

  const handleExpandComplete = useCallback(() => {
    // Phase 1 done: switch theme
    onComplete(); // This triggers the actual mode change
    setPhase('collapse');
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9998] pointer-events-none"
      style={{ willChange: 'clip-path' }}
      initial={false}
      animate={{
        clipPath:
          phase === 'expand'
            ? `circle(150% at ${x}px ${y}px)`
            : `circle(0% at ${x}px ${y}px)`,
        backgroundColor: isDark ? '#1A1826' : '#FFFEFA',
      }}
      transition={
        phase === 'expand'
          ? { duration: 0.55, ease: [0.4, 0, 0.2, 1] }
          : { duration: 0.35, ease: [0.4, 0, 1, 1] }
      }
      onAnimationComplete={phase === 'expand' ? handleExpandComplete : undefined}
    />
  );
}

export function DarkModeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipple({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    },
    []
  );

  const handleRippleComplete = useCallback(() => {
    toggleMode();
  }, [toggleMode]);

  const handleCollapseDone = useCallback(() => {
    setRipple(null);
  }, []);

  const isDark = mode === 'dark';

  return (
    <>
      <AnimatePresence onExitComplete={handleCollapseDone}>
        {ripple && (
          <RippleOverlay
            x={ripple.x}
            y={ripple.y}
            isDark={!isDark}
            onComplete={handleRippleComplete}
          />
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border-[1.5px] bg-card text-foreground shadow-flat hover:shadow-flat-hover transition-shadow cursor-pointer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <Icon
            icon={isDark ? 'mdi:white-balance-sunny' : 'mdi:nightlight'}
            width={20}
            height={20}
          />
        </motion.div>
      </motion.button>
    </>
  );
}
