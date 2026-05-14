import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface TabItem {
  labelKey: string;
  icon: string;
  path: string;
  circular?: boolean;
}

const TABS: TabItem[] = [
  { labelKey: 'nav.home', icon: 'mdi:home', path: '/' },
  { labelKey: 'nav.forum', icon: 'mdi:text-box-multiple', path: '/forum' },
  { labelKey: 'nav.createPost', icon: 'mdi:pencil-plus', path: '/create', circular: true },
  { labelKey: 'nav.ai', icon: 'mdi:robot-happy', path: '/ai' },
  { labelKey: 'nav.profile', icon: 'mdi:account-circle', path: '/profile' },
];

export function BottomNav() {
  const { t } = useTranslation();
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

        if (tab.circular) {
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-end flex-1 h-[60px]"
            >
              <div
                className={cn(
                  'absolute -top-5 flex items-center justify-center size-12 rounded-full shadow-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground scale-110'
                    : 'bg-primary text-primary-foreground hover:scale-105',
                )}
              >
                <Icon icon={tab.icon} width={22} height={22} />
              </div>
              <span className="text-[10px] leading-none text-muted-foreground mb-1">
                {t(tab.labelKey)}
              </span>
            </button>
          );
        }

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
              {t(tab.labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
