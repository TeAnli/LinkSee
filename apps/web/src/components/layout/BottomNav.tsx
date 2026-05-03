import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface TabItem {
  label: string;
  icon: string;
  path: string;
}

const TABS: TabItem[] = [
  { label: 'Home', icon: 'mdi:home', path: '/' },
  { label: 'Forum', icon: 'mdi:text-box-multiple', path: '/forum' },
  { label: 'AI', icon: 'mdi:robot-happy', path: '/ai' },
  { label: 'Chat', icon: 'mdi:message-text', path: '/messages' },
  { label: 'Me', icon: 'mdi:account-circle', path: '/profile' },
];

export function BottomNav() {
  const [activePath, setActivePath] = useState('/');

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-end justify-around h-[64px] border-t-[1.5px]"
      style={{
        backgroundColor: 'var(--topbar-bg)',
        borderColor: 'var(--border-color)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = activePath === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => setActivePath(tab.path)}
            className="relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer"
          >
            {/* Top indicator bar */}
            {isActive && (
              <motion.div
                className="absolute top-0 w-6 h-[3px] rounded-b-md"
                layoutId="bottom-nav-indicator"
                style={{ backgroundColor: 'var(--primary)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}

            <motion.div
              animate={isActive ? { scale: 1.12 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            >
              <Icon
                icon={tab.icon}
                width={24}
                height={24}
                style={{ color: isActive ? 'var(--primary)' : 'var(--muted-fg)' }}
              />
            </motion.div>

            <span
              className="text-[11px] leading-none font-semibold"
              style={{
                color: isActive ? 'var(--primary)' : 'var(--muted-fg)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
