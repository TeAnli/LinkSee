import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThemeSettingsPanel } from '../theme/ThemeSettingsPanel';
import { DarkModeToggle } from '../theme/DarkModeToggle';
import { useAuthStore } from '@/stores/useAuthStore';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/forum': 'Forum',
  '/ai': 'AI Assistant',
  '/messages': 'Messages',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const title = PAGE_TITLES[location.pathname] ?? 'Page';

  return (
    <TooltipProvider delayDuration={300}>
      <header
        className="fixed top-0 right-0 left-0 lg:left-64 h-[60px] z-20 flex items-center justify-between px-5 border-b-[1.5px] border-border"
        style={{
          backgroundColor: 'var(--topbar-bg)',
          transition: 'left 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Left: Page title */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base font-bold truncate text-foreground">
            {title}
          </h1>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-[380px] mx-8">
          <div className="relative w-full">
            <Icon
              icon="mdi:magnify"
              width={18}
              height={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              type="text"
              placeholder="Search posts, users, topics..."
              className="pl-10 pr-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
                <Icon icon="mdi:bell-outline" width={20} height={20} />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 size-3 p-0 justify-center text-[8px]"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Notifications</TooltipContent>
          </Tooltip>

          {/* Theme settings */}
          <ThemeSettingsPanel />

          {/* Dark mode toggle */}
          <DarkModeToggle />

          {/* User avatar / Login */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label={isAuthenticated ? 'User menu' : 'Sign in'}
                onClick={() => {
                  if (!isAuthenticated) navigate('/login');
                }}
              >
                <Avatar className="size-full">
                  {isAuthenticated && user?.avatarUrl && (
                    <AvatarImage src={user.avatarUrl} alt={user.nickname} />
                  )}
                  <AvatarFallback className="size-full text-xs">
                    {isAuthenticated && user?.nickname
                      ? user.nickname.slice(0, 1).toUpperCase()
                      : <Icon icon="mdi:login" width={18} height={18} />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isAuthenticated
                ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-xs">{user?.nickname ?? 'User'}</span>
                      <button
                        className="text-xs font-medium hover:underline"
                        style={{ color: 'var(--primary)' }}
                        onClick={(e) => { e.stopPropagation(); logout(); navigate('/login'); }}
                      >
                        Sign out
                      </button>
                    </div>
                  )
                : 'Sign in'}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
