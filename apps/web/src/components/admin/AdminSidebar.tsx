import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AdminNavItem {
  labelKey: string;
  icon: string;
  path: string;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { labelKey: 'admin.nav.dashboard', icon: 'mdi:view-dashboard', path: '/admin/dashboard' },
  { labelKey: 'admin.nav.review', icon: 'mdi:clipboard-check', path: '/admin/review' },
  { labelKey: 'admin.nav.users', icon: 'mdi:account-group', path: '/admin/users' },
  { labelKey: 'admin.nav.posts', icon: 'mdi:shield-check', path: '/admin/posts' },
  { labelKey: 'admin.nav.categories', icon: 'mdi:folder-cog', path: '/admin/categories' },
  { labelKey: 'admin.nav.ai', icon: 'mdi:robot', path: '/admin/ai' },
  { labelKey: 'admin.nav.sensitiveWords', icon: 'mdi:shield-alert', path: '/admin/sensitive-words' },
];

const ADMIN_SIDEBAR_WIDTH = 240;
const ADMIN_SIDEBAR_COLLAPSED_WIDTH = 64;
const ADMIN_TOPBAR_HEIGHT = 56;

export { ADMIN_SIDEBAR_WIDTH, ADMIN_SIDEBAR_COLLAPSED_WIDTH, ADMIN_TOPBAR_HEIGHT };

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ y: 0, h: 0 });

  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    if (el && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const viewport = navRef.current.parentElement;
      setIndicator({
        y: elRect.top - navRect.top + (viewport?.scrollTop ?? 0),
        h: elRect.height,
      });
    }
  }, [location.pathname, collapsed]);

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-30 overflow-hidden"
        style={{
          width: collapsed ? `${ADMIN_SIDEBAR_COLLAPSED_WIDTH}px` : `${ADMIN_SIDEBAR_WIDTH}px`,
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1.5px solid var(--border-color)',
          transition: 'width 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div
          className={cn(
            'flex items-center min-h-[56px] border-b border-border',
            collapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
          )}
        >
          <button
            onClick={onToggle}
            className="flex items-center justify-center size-9 rounded-lg border-[1.5px] border-border shadow-flat shrink-0 hover:brightness-110 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all duration-200"
            style={{ backgroundColor: 'var(--primary)' }}
            aria-label="Toggle sidebar"
          >
            <Icon icon="mdi:shield-crown" width={18} height={18} color="#fff" />
          </button>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap">
              <span className="text-sm font-bold leading-tight text-foreground">Admin</span>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {t('admin.common.panel')}
              </span>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <nav ref={navRef} className="relative flex flex-col gap-0.5 px-2 py-2">
            {!collapsed && (
              <div
                className="nav-indicator absolute left-0 w-1 rounded-r-full bg-primary pointer-events-none"
                style={{
                  '--indicator-y': `${indicator.y}px`,
                  '--indicator-h': `${indicator.h}px`,
                } as React.CSSProperties}
              />
            )}

            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      data-active={isActive || undefined}
                      className={cn(
                        'relative w-full h-10',
                        collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3',
                        isActive ? 'text-primary' : 'text-muted-foreground',
                      )}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon icon={item.icon} width={20} height={20} className="shrink-0" />
                      {!collapsed && (
                        <span className="text-[13px] font-semibold truncate">{t(item.labelKey)}</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{t(item.labelKey)}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />
        <div
          className={cn(
            'flex items-center min-h-[48px]',
            collapsed ? 'justify-center px-2 py-2' : 'gap-2 px-3 py-2',
          )}
        >
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => navigate('/')}
            >
              <Icon icon="mdi:arrow-left" width={16} height={16} />
              <span className="text-xs font-semibold">{t('admin.common.backToFront')}</span>
            </Button>
          )}
          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground"
                  onClick={() => navigate('/')}
                >
                  <Icon icon="mdi:arrow-left" width={18} height={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t('admin.common.backToFront')}</TooltipContent>
            </Tooltip>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto shrink-0"
              onClick={onToggle}
              aria-label="Collapse sidebar"
            >
              <Icon icon="mdi:chevron-left" width={18} height={18} />
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
