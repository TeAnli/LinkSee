import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';
import { TopBar } from './TopBar';
import { RightPanel, RIGHT_PANEL_WIDTH } from './RightPanel';
import { BottomNav } from './BottomNav';
import { useThemeStore } from '@/stores/useThemeStore';
import { useSyncCSSVar } from '@/hooks/useSyncCSSVar';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const collapsed = useThemeStore((s) => s.sidebarCollapsed);
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  useSyncCSSVar('--sidebar-w', `${sidebarWidth}px`);
  useSyncCSSVar('--right-panel-w', `${RIGHT_PANEL_WIDTH}px`);

  const location = useLocation();
  const isPostDetail = location.pathname.startsWith('/post/');
  const isCreatePost = location.pathname === '/create';
  const hideRightPanel = isPostDetail || isCreatePost;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar />
      <TopBar />

      <main
        className={cn(
          'pt-[76px] pb-24 lg:pb-8 px-5 lg:px-8 min-h-screen lg:ml-[var(--sidebar-w)]',
          !hideRightPanel && 'xl:mr-[var(--right-panel-w)]',
        )}
        style={{
          transition: 'margin 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="w-full">
          <Outlet />
        </div>
      </main>

      {!hideRightPanel && <RightPanel />}
      <BottomNav />
    </div>
  );
}
