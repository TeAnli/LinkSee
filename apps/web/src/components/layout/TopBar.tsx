import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThemeSettingsPanel } from '../theme/ThemeSettingsPanel';
import { DarkModeToggle } from '../theme/DarkModeToggle';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { NotificationPanel } from '../notification/NotificationPanel';
import { CheckInPanel } from '../checkin/CheckInPanel';
import { MobileMoreMenu } from './MobileMoreMenu';
import { useAuthStore } from '@/stores/useAuthStore';

const PAGE_TITLE_KEYS: Record<string, string> = {
  '/': 'nav.home',
  '/forum': 'nav.forum',
  '/ai': 'nav.ai',
  '/messages': 'nav.messages',
  '/profile': 'nav.profile',
  '/settings': 'nav.settings',
};

export function TopBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const title = PAGE_TITLE_KEYS[location.pathname] ?? 'common.noData';

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
            {t(title)}
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
              placeholder={t('topBar.searchPlaceholder')}
              className="pl-10 pr-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile more menu (hidden on desktop) */}
          <MobileMoreMenu />

          {/* Desktop-only action buttons */}
          <div className="hidden md:flex items-center gap-2">
            <CheckInPanel />
            <NotificationPanel />
            <ThemeSettingsPanel />
            <LanguageSwitcher />
            <DarkModeToggle />
          </div>

          {/* User avatar / Login */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label={isAuthenticated ? t('topBar.userMenu') : t('auth.signIn')}
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
                      {t('auth.signOut')}
                    </button>
                  </div>
                )
                : t('auth.signIn')}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
