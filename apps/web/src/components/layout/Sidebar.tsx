import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useThemeStore } from '@/stores/useThemeStore';
import { cn } from '@/lib/utils';

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

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 68;

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = useThemeStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useThemeStore((s) => s.toggleSidebar);

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="hidden lg:flex flex-col h-screen border-r-[1.5px] border-border fixed left-0 top-0 z-30 overflow-hidden"
        style={{
          width: collapsed ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`,
          backgroundColor: 'var(--sidebar-bg)',
          transition: 'width 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Logo area */}
        <div
          className={cn(
            'flex items-center min-h-[72px] border-b border-border',
            collapsed ? 'justify-center px-3 pt-4 pb-4' : 'gap-3 px-4 pt-5 pb-4',
          )}
        >
          <div
            className="flex items-center justify-center size-10 rounded-xl border-[1.5px] border-border shadow-flat shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Icon icon="mdi:forum" width={22} height={22} color="#fff" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap">
              <span className="text-base font-bold leading-tight text-foreground">LinkSee</span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                LingXi Forum
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-1 px-2.5 py-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'relative w-full h-11',
                        collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3',
                        isActive ? 'text-primary' : 'text-muted-foreground',
                      )}
                      onClick={() => navigate(item.path)}
                    >
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary"
                        />
                      )}
                      <Icon icon={item.icon} width={22} height={22} className="shrink-0" />
                      {!collapsed && (
                        <span className="text-sm font-semibold truncate">
                          {item.label}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom: user + collapse toggle */}
        <Separator />
        <div
          className={cn(
            'flex items-center border-t-0 min-h-[56px]',
            collapsed ? 'flex-col gap-2 px-2.5 py-3 justify-center' : 'gap-2 px-3 py-3',
          )}
        >
          <Avatar className="shrink-0">
            <AvatarFallback>
              <Icon icon="mdi:account" width={16} height={16} />
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="text-sm font-bold truncate text-foreground">User</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn('shrink-0', collapsed ? 'size-7' : 'ml-auto')}
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon
              icon={collapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'}
              width={18}
              height={18}
            />
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
