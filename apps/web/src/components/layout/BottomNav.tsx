import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

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
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-end justify-around h-[64px] border-t-[1.5px] border-border"
      style={{
        backgroundColor: 'var(--topbar-bg)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Button
            key={tab.path}
            variant="ghost"
            onClick={() => navigate(tab.path)}
            className="relative flex-col items-center justify-center flex-1 h-full gap-0.5 rounded-none border-transparent"
          >
            {/* Top indicator bar */}
            {isActive && (
              <motion.div
                className="absolute top-0 w-6 h-[3px] rounded-b-md bg-primary"
                layoutId="bottom-nav-indicator"
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
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
              />
            </motion.div>

            <span
              className={`text-[11px] leading-none ${isActive ? 'font-semibold text-primary' : 'font-normal text-muted-foreground'}`}
            >
              {tab.label}
            </span>
          </Button>
        );
      })}
    </nav>
  );
}
