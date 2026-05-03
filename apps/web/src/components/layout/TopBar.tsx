import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { ThemeSettingsPanel } from '../theme/ThemeSettingsPanel';
import { DarkModeToggle } from '../theme/DarkModeToggle';

export function TopBar() {
  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-64 h-[60px] z-20 flex items-center justify-between px-5 border-b-[1.5px]"
      style={{
        backgroundColor: 'var(--topbar-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Left: Page title / breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-base font-bold truncate" style={{ color: 'var(--fg)' }}>
          Home
        </h1>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex flex-1 max-w-[380px] mx-8">
        <div className="relative w-full">
          <Icon
            icon="mdi:magnify"
            width={18}
            height={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted-fg)' }}
          />
          <input
            type="text"
            placeholder="Search posts, users, topics..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border-[1.5px] text-sm font-medium placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            style={{
              backgroundColor: 'var(--muted)',
              borderColor: 'var(--border-color)',
              color: 'var(--fg)',
            }}
          />
        </div>
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-2">
        {/* Notification bell with badge */}
        <motion.button
          className="relative flex items-center justify-center w-9 h-9 rounded-xl border-[1.5px] bg-card shadow-flat hover:shadow-flat-hover cursor-pointer"
          style={{ borderColor: 'var(--border-color)' }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Notifications"
        >
          <Icon icon="mdi:bell-outline" width={20} height={20} />
          <span
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-[1.5px]"
            style={{ backgroundColor: '#FF6B6B', borderColor: 'var(--card-bg)' }}
          />
        </motion.button>

        {/* Theme settings popover */}
        <ThemeSettingsPanel />

        {/* Dark mode toggle */}
        <DarkModeToggle />

        {/* User avatar */}
        <motion.button
          className="flex items-center justify-center w-[34px] h-[34px] rounded-full border-[1.5px] shadow-flat cursor-pointer"
          style={{
            backgroundColor: 'var(--muted)',
            borderColor: 'var(--border-color)',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="User menu"
        >
          <Icon icon="mdi:account" width={18} height={18} style={{ color: 'var(--muted-fg)' }} />
        </motion.button>
      </div>
    </header>
  );
}
