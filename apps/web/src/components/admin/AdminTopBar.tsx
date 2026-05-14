import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/useAuthStore';
import { ADMIN_SIDEBAR_WIDTH, ADMIN_SIDEBAR_COLLAPSED_WIDTH } from './AdminSidebar';

const ADMIN_PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'admin.nav.dashboard',
  '/admin/users': 'admin.nav.users',
  '/admin/posts': 'admin.nav.posts',
  '/admin/categories': 'admin.nav.categories',
  '/admin/ai': 'admin.nav.ai',
};

export function AdminTopBar({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const titleKey = ADMIN_PAGE_TITLES[location.pathname] ?? 'admin.common.panel';
  const sidebarWidth = sidebarCollapsed ? ADMIN_SIDEBAR_COLLAPSED_WIDTH : ADMIN_SIDEBAR_WIDTH;

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center justify-between px-5 h-[56px] border-b-[1.5px] border-border"
      style={{
        left: `${sidebarWidth}px`,
        backgroundColor: 'var(--topbar-bg)',
        transition: 'left 250ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon icon="mdi:shield-crown" width={18} height={18} className="text-primary shrink-0" />
        <h1 className="text-sm font-bold truncate text-foreground">{t(titleKey)}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hidden md:flex"
          onClick={() => navigate('/')}
        >
          <Icon icon="mdi:open-in-new" width={14} height={14} />
          <span className="text-xs font-semibold">{t('admin.common.backToFront')}</span>
        </Button>

        <Separator orientation="vertical" className="h-5 hidden md:block" />

        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.nickname} />}
            <AvatarFallback className="size-7 text-[10px]">
              {user?.nickname ? user.nickname.slice(0, 1).toUpperCase() : 'A'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-foreground hidden md:inline">
            {user?.nickname ?? 'Admin'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => { logout(); navigate('/login'); }}
          >
            <Icon icon="mdi:logout" width={16} height={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}
