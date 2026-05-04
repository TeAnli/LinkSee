import { Outlet } from 'react-router-dom';
import { Sidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './Sidebar';
import { TopBar } from './TopBar';
import { RightPanel, RIGHT_PANEL_WIDTH } from './RightPanel';
import { BottomNav } from './BottomNav';
import { useThemeStore } from '@/stores/useThemeStore';
import { useSyncCSSVar } from '@/hooks/useSyncCSSVar';

export function AppLayout() {
  const collapsed = useThemeStore((s) => s.sidebarCollapsed);
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  useSyncCSSVar('--sidebar-w', `${sidebarWidth}px`);
  useSyncCSSVar('--right-panel-w', `${RIGHT_PANEL_WIDTH}px`);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar />
      <TopBar />

      <main
        className="pt-[76px] pb-24 lg:pb-8 px-5 lg:px-8 min-h-screen"
        style={{
          marginLeft: 'var(--sidebar-w, 0px)',
          marginRight: 'var(--right-panel-w, 0px)',
          transition: 'margin-left 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="mx-auto w-full max-w-[960px]">
          <Outlet />
        </div>
      </main>

      <RightPanel />
      <BottomNav />
    </div>
  );
}
