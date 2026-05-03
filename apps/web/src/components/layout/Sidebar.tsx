import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'mdi:home', path: '/' },
  { label: 'Forum', icon: 'mdi:text-box-multiple', path: '/forum' },
  { label: 'AI Assistant', icon: 'mdi:robot-happy', path: '/ai' },
  { label: 'Messages', icon: 'mdi:message-text-outline', path: '/messages' },
  { label: 'Profile', icon: 'mdi:account-circle-outline', path: '/profile' },
  { label: 'Settings', icon: 'mdi:cog-outline', path: '/settings' },
];

export function Sidebar() {
  const [activePath, setActivePath] = useState('/');

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen border-r-[1.5px] fixed left-0 top-0 z-30"
      style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl border-[2px]"
          style={{
            backgroundColor: 'var(--primary)',
            borderColor: 'var(--border-color)',
            boxShadow: '2px 2px 0 var(--border-color)',
          }}
        >
          <Icon icon="mdi:forum" width={28} height={28} color="#fff" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-tight">LinkSee</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--muted-fg)' }}>
            LingXi Forum
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.path;
          return (
            <motion.button
              key={item.path}
              onClick={() => setActivePath(item.path)}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-left cursor-pointer transition-colors`}
              style={{
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--muted-fg)',
              }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: NAV_ITEMS.indexOf(item) * 0.06 }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                  style={{ backgroundColor: 'var(--primary)' }}
                  layoutId="sidebar-active-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon icon={item.icon} width={22} height={22} />
              <span className="text-sm font-semibold">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom user area */}
      <div className="flex items-center gap-3 px-5 py-4 border-t-[1.5px" style={{ borderColor: 'var(--border-color)' }}>
        <div
          className="w-9 h-9 rounded-full border-[1.5px] flex-shrink-0"
          style={{
            backgroundColor: 'var(--muted)',
            borderColor: 'var(--border-color)',
          }}
        />
        <span className="text-sm font-bold truncate" style={{ color: 'var(--fg)' }}>
          User
        </span>
        <button className="ml-auto cursor-pointer" aria-label="Open theme settings">
          <Icon icon="mdi:palette-outline" width={18} height={18} style={{ color: 'var(--muted-fg)' }} />
        </button>
      </div>
    </aside>
  );
}
