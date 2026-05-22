import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  '/create': 'nav.createPost',
  '/login': 'auth.signIn',
  '/register': 'auth.register',
  '/forgot-password': 'auth.forgotPassword',
  '/reset-password': 'auth.resetPassword',
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLE_KEYS[pathname]) return PAGE_TITLE_KEYS[pathname];
  return 'common.appName';
}

export function TopBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const title = resolveTitle(location.pathname);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && searchQuery.trim()) {
        navigate(`/forum?keyword=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
      }
    },
    [searchQuery, navigate],
  );

  return (
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder={t('topBar.searchPlaceholder')}
            className="pl-10 pr-4"
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
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label={t('topBar.userMenu')}
              >
                <Avatar className="size-full">
                  {user?.avatarUrl && (
                    <AvatarImage src={user.avatarUrl} alt={user?.nickname} />
                  )}
                  <AvatarFallback className="size-full text-xs">
                    {(user?.nickname ?? 'U').slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="text-sm font-bold">{user?.nickname}</p>
                <p className="text-xs text-muted-foreground">@{user?.username}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Icon icon="mdi:account-outline" className="mr-2 h-4 w-4" />
                {t('nav.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Icon icon="mdi:cog-outline" className="mr-2 h-4 w-4" />
                {t('nav.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => { logout(); navigate('/'); }}
                className="text-destructive"
              >
                <Icon icon="mdi:logout" className="mr-2 h-4 w-4" />
                {t('auth.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label={t('auth.signIn')}
            onClick={() => navigate('/login')}
          >
            <Icon icon="mdi:login" width={18} height={18} />
          </Button>
        )}
      </div>
    </header>
  );
}
