import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { ColorPicker } from './ColorPicker';
import { DarkModeToggle } from './DarkModeToggle';

export function ThemeSettingsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-xl border-[1.5px] bg-card shadow-flat hover:shadow-flat-hover transition-shadow cursor-pointer"
        style={{ borderColor: 'var(--border-color)' }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Theme settings"
      >
        <Icon icon="mdi:palette-outline" width={20} height={20} />
      </motion.button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[9996]" onClick={() => setOpen(false)} />

            <motion.div
              className="absolute right-0 top-full mt-2 z-[9997] rounded-2xl border-[2px] bg-card p-3 shadow-flat-lg min-w-[240px]"
              style={{ borderColor: 'var(--border-color)' }}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-fg)' }}>
                Theme
              </h3>
              <ColorPicker />

              <div className="mt-3 pt-3 border-t-[1.5px]" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--muted-fg)' }}>Mode</span>
                  <div className="ml-auto">
                    <DarkModeToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
