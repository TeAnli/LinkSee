import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-end justify-around border-t-[1.5px] border-border"
      style={{
        backgroundColor: 'var(--topbar-bg)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {TABS.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="relative flex flex-col items-center justify-center flex-1 h-[60px] gap-0.5"
          >
            {/* Top indicator bar */}
            <span
              className={cn(
                'absolute top-0 h-[3px] rounded-b-md bg-primary transition-all duration-280',
                isActive ? 'w-6 opacity-100' : 'w-0 opacity-0',
              )}
            />
            <Icon
              icon={tab.icon}
              width={24}
              height={24}
              className={cn(
                'transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            />
            <span
              className={cn(
                'text-[11px] leading-none transition-all duration-200',
                isActive ? 'font-semibold text-primary' : 'font-normal text-muted-foreground',
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
